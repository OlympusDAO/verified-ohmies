import {
  FIND_USER_BY_ADDRESS,
  DELETE_USER_VERIFIED_BY_DISCORDID,
  FIND_USER_BY_DISCORDID,
  INSERT_USER_ONE,
  INSERT_USER_VERIFIED_ONE,
  SET_USER_VERIFIED_TOKENS,
  SET_USER_VERIFIED_NONCE,
  SET_USER_VERIFIED_AUTHSTATUS,
  SET_USER_CHAINID,
} from "../graphql/user";
import { utils } from "ethers";
import { randomBytes } from "crypto";
import { hasuraRequest } from "./hasura";

const recoverAddress = (nonce: string, signature: string) => {
  const address = utils.verifyMessage(nonce, signature);
  return address;
};

const generateNonce = async () => {
  const buffer = await randomBytes(16);
  return buffer.toString("hex");
};

export const getAuthenticationChallenge = async (address: string, discordUserId: string, chainId: number) => {
  // Important: See in the root folder of this project `assets/diagrams/user-verified-insert-update.png`
  // for a diagram of this DB flow

  // Check if `user` with this `address` already exists
  const checkUser = await hasuraRequest(FIND_USER_BY_ADDRESS, { address });
  const user = (await checkUser.json()) as any;
  console.log(`FIND_USER_BY_ADDRESS: ${JSON.stringify(user)}`);
  // Check if `user_verified` with this `discordUserId` already exists
  const checkUserVerified = await hasuraRequest(FIND_USER_BY_DISCORDID, { discordUserId });
  const userVerified = (await checkUserVerified.json()) as any;
  console.log(`FIND_USER_BY_DISCORDID: ${JSON.stringify(userVerified)}`);

  var addressExists, discordUserIdExists;
  // If any of these happens, something has gone terribly wrong. `discordUserId` and
  // `address` are unique fields.
  if (user.data.user.length === 0) {
    addressExists = false;
  } else if (user.data.user.length === 1) {
    addressExists = true;
  } else {
    throw Error(`Unexpected number of records found for this Ethereum address. (address: ${address})`);
  }
  if (userVerified.data.user.length === 0) {
    discordUserIdExists = false;
  } else if (userVerified.data.user.length === 1) {
    discordUserIdExists = true;
  } else {
    throw Error(`Unexpected number of records found for this Discord User ID. (discordUserId: ${discordUserId})`);
  }

  // If `address` doesn't exist in `user` table
  if (!addressExists) {
    console.log(`(address: ${address}, discordUserId: ${discordUserId}) ADDRESS EXISTS ? - [NO]`);
    // If `discordUserId` hasn't been registered yet, we'll just create a new `user` from scratch
    // Fields `address` and `chainId` go into `user`.
    // Field `discordUserId` goes into `user_verified`;
    if (!discordUserIdExists) {
      console.log(`(address: ${address}, discordUserId: ${discordUserId}) DISCORD ID EXISTS ? - [NO]`);
    }
    // If `discordUserId` has already been registered, we first delete `user_verified` for that `discordUserId`, and only then
    // insert a new `user` from scratch.
    // This is the case of a Discord user that had already authenticated, and is returning to authenticate with a different `address`,
    // such that the new `address` is NOT YET registered in `user`.
    // Example: user authenticates on Verified Ohmies with `address` X. Then, later on, he comes back and authenticates with address Y,
    // such that address Y was still not in `user`.
    // Result: user_verified with this user's `discordUserId` gets deleted and
    // `user` with address Y gets inserted now to be paired with a `user_verified` with this `discordUserId`.
    else {
      console.log(`(address: ${address}, discordUserId: ${discordUserId}) DISCORD ID EXISTS ? - [YES]`);
      // Delete old user verified
      const deleteResponse = await hasuraRequest(DELETE_USER_VERIFIED_BY_DISCORDID, {
        discordUserId,
      });
      const dResponse = await deleteResponse.json();
      console.log(`DELETE_USER_VERIFIED_BY_DISCORDID:`, JSON.stringify(dResponse));
    }

    const insertResponse = await hasuraRequest(INSERT_USER_ONE, {
      address,
      chainId,
      discordUserId,
    });
    const response = await insertResponse.json();
    console.log(`INSERT_USER_ONE:`, JSON.stringify(response));
    // If `address` exists in `user` table
  } else {
    console.log(`(address: ${address}, discordUserId: ${discordUserId}) ADDRESS EXISTS ? - [YES]`);
    // If this `address` is already paired to a `discordUserId`
    if (user.data.user[0].user_verified !== null) {
      console.log(
        `(address: ${address}, discordUserId: ${discordUserId}) ADDRESS ALREADY PAIRED TO DISCORD ID ? - [YES]`
      );
      // The following case will happen in these situations:
      // 1 - If for some reason the user started the authentication flow but then, for instance, canceled the signature on MetaMask,
      // their pair `address`/`discordUserId` will be registered, but they wouldn't have gotten the role on Discord. So we want
      // to let them authenticate again (`authStatus` in this case will be "AUTH_PENDING").
      // 2 - The user has already successfuly authenticated in a certain chainId with a specific address, but now wants to authenticate in a
      // different `chainId` with the same address (`authStatus` in this case will be "AUTH_SUCCESS").
      if (user.data.user[0].user_verified.discordUserId === discordUserId) {
        console.log(`(address: ${address}, discordUserId: ${discordUserId}) SAME DISCORD ID AS THIS ONE ? - [YES]`);
        const setChainResponse = await hasuraRequest(SET_USER_CHAINID, {
          address, // where
          chainId, // _set
        });
        const cResponse = await setChainResponse.json();
        console.log(`SET_USER_CHAINID:`, JSON.stringify(cResponse));
        const setTokensResponse = await hasuraRequest(SET_USER_VERIFIED_TOKENS, {
          discordUserId, // where
          tokens: null, // _set
        });
        const tResponse = await setTokensResponse.json();
        console.log(`SET_USER_VERIFIED_TOKENS:`, JSON.stringify(tResponse));
        // If it's a different `discordUserId` from the one this user is trying to authenticate with, the address is considered locked, so we throw error
      } else {
        console.log(`(address: ${address}, discordUserId: ${discordUserId}) SAME DISCORD ID AS THIS ONE ? - [NO]`);
        throw Error("Another Discord user is already registered with this Ethereum address.");
      }
    }
    // If this `address` is not yet paired to a `discordUserId`, it's free to take
    else {
      console.log(`(address: ${address}, discordUserId: ${discordUserId}) ADDRESS PAIRED TO DISCORD ID ? - [NO]`);
      // If `discordUserId` hasn't been registered yet, we simply pair it to the `address`
      if (!discordUserIdExists) {
        console.log(`(address: ${address}, discordUserId: ${discordUserId}) DISCORD ID EXISTS ? - [NO]`);
      }
      // If `discordUserId` has already been registered, we first delete `user_verified` for that `discordUserId`, and only then
      // pair this `discordUserId` to the `address`.
      // This is the case of a Discord user that had already authenticated and is returning to authenticate with a different `address`,
      // such that the new `address` IS ALREADY registered in `user` but didn't have attributed a `discordUserId`.
      // Example: user authenticates on Verified Ohmies with `address` X and also on Odyssey with `address` Y. But then user X
      // tries to authenticate again on Verified Ohmies, but now with `address` Y.
      // Result: `user_verified` with this user's `discordUserId` gets deleted and
      // `user` with address Y gets updated to be paired with this `discordUserId`.
      else {
        console.log(`(address: ${address}, discordUserId: ${discordUserId}) DISCORD ID EXISTS ? - [YES]`);
        // Delete old user verified
        const deleteResponse = await hasuraRequest(DELETE_USER_VERIFIED_BY_DISCORDID, {
          discordUserId,
        });
        const dResponse = await deleteResponse.json();
        console.log(`DELETE_USER_VERIFIED_BY_DISCORDID:`, JSON.stringify(dResponse));
      }

      // Set the new `chainId` for this `address` and get the `id` of the updated `user`
      const setChainResponse = await hasuraRequest(SET_USER_CHAINID, {
        address, // where
        chainId, // _set
      });
      const cResponse = await setChainResponse.json();
      console.log(`SET_USER_CHAINID:`, JSON.stringify(cResponse));
      const user_id = cResponse.data.update_user.returning[0].id;
      // Move this `discordUserId` to the pre-existing `user` with this `address`.
      const insertResponse = await hasuraRequest(INSERT_USER_VERIFIED_ONE, {
        user_id,
        discordUserId,
      });
      const iResponse = await insertResponse.json();
      console.log(`INSERT_USER_VERIFIED_ONE:`, JSON.stringify(iResponse));
    }
  }

  // Initialize `authStatus` with `AUTH_PENDING`. If the user doesn't conclude the authentication for some reason
  // (for example they cancel the signature on MetaMask), the status will stay as `AUTH_PENDING`.
  const setStatusResponse = await hasuraRequest(SET_USER_VERIFIED_AUTHSTATUS, {
    discordUserId, // where
    authStatus: "AUTH_PENDING", // _set
  });
  const sResponse = await setStatusResponse.json();
  console.log(`SET_USER_VERIFIED_AUTHSTATUS:`, JSON.stringify(sResponse));

  // Generate a new nonce for this `discordUserId`
  const newNonce = await generateNonce();
  const setNonceResponse = await hasuraRequest(SET_USER_VERIFIED_NONCE, {
    discordUserId, // where
    nonce: newNonce, // _set
  });
  const nResponse = await setNonceResponse.json();

  console.log(`SET_USER_VERIFIED_NONCE:`, JSON.stringify(nResponse));
  if (nResponse.errors) {
    throw Error("Error setting user nonce.");
  }
  return newNonce;
};

export const authenticate = async (discordUserId: string, signature: string) => {
  const checkUser = await hasuraRequest(FIND_USER_BY_DISCORDID, { discordUserId });
  const user = (await checkUser.json()) as any;
  console.log(`FIND_USER_BY_DISCORDID:`, JSON.stringify(user));

  if (user.data.user.length === 0) throw new Error("User not found.");
  if (user.data.user.length !== 1) throw new Error("Unexpected number of records found for this Discord User ID.");
  const address = user.data.user[0].address;
  const chainId = user.data.user[0].chainId;
  const nonce = user.data.user[0].user_verified.nonce;

  // Recover the address that corresponds to this pair nonce / signature,
  // and check if it matches the one the user claims to have.
  console.log("Fetched nonce:", nonce);
  console.log("Signature:", signature);
  const recoveredAddress = recoverAddress(nonce, signature);

  if (recoveredAddress.toLowerCase() === address.toLowerCase()) {
    // If the check passes, return the Discord User ID to attribute the role
    return { address, chainId };
  } else {
    throw new Error("Bad signature.");
  }
};
