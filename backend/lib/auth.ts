import { FIND_ONE_USER, INSERT_ONE_USER, SET_USER_NONCE, SET_USER_ADDRESS } from "../graphql/user";
import { utils } from "ethers";
import { randomBytes } from "crypto";
import { hasuraRequest } from "./hasura";
import { assert } from "console";

const recoverAddress = (nonce: string, signature: string) => {
  const address = utils.verifyMessage(nonce, signature);
  return address;
};

const generateNonce = async () => {
  const buffer = await randomBytes(16);
  return buffer.toString("hex");
};

export const getAuthenticationChallenge = async (publicAddress: string, discordUserId: string, chainId: number) => {
  // Check if user with this discordUserId exists
  const checkUser = await hasuraRequest(FIND_ONE_USER, { discordUserId });
  const user = (await checkUser.json()) as any;
  // console.log("checkUser response:", checkUser);
  console.log(`User: ${JSON.stringify(user)}`);

  // If discordUserId hasn't been registered yet, register it
  if (user.data.discord_ohmies.length == 0) {
    const insertResponse = await hasuraRequest(INSERT_ONE_USER, {
      publicAddress,
      chainId,
      discordUserId,
    });
    const response = await insertResponse.json();
    console.log(`INSERT_ONE_USER response:`, response);

    // This will happen for example in the case where two different
    // discordUserId try to authenticate with the same publicAddress
    // Message is in response.errors[0].message
    if (response.errors) {
      throw Error("Error creating user. A possible cause is that this Ethereum address is already in use.");
    }
  } else {
    // If the discordUserId already existed, replace the chainId and publicAddress with the
    // one the user is currently trying to authenticate (this will also set `ownedTokens` to null)
    const setResponse = await hasuraRequest(SET_USER_ADDRESS, {
      publicAddress,
      chainId,
      discordUserId,
    });
    const response = await setResponse.json();
    console.log(`SET_USER_ADDRESS response:`, response);
    if (response.errors) {
      throw Error("Error updating Ethereum address. A possible cause is that this address is already in use.");
    }
  }

  // Generate a new nonce for this discordUserId
  const newNonce = await generateNonce();
  const setResponse = await hasuraRequest(SET_USER_NONCE, { discordUserId, nonce: newNonce });
  const response = await setResponse.json();

  console.log(`SET_USER_NONCE response:`, response);
  if (response.errors) {
    throw Error("Error setting user nonce.");
  }
  console.log({ newNonce });
  return newNonce;
};

export const authenticate = async (discordUserId: string, signature: string) => {
  const checkUser = await hasuraRequest(FIND_ONE_USER, { discordUserId });
  const user = (await checkUser.json()) as any;

  if (user.data.discord_ohmies.length == 0) throw new Error("User not found.");
  assert(user.data.discord_ohmies.length == 1);
  const publicAddress = user.data.discord_ohmies[0].publicAddress;
  const nonce = user.data.discord_ohmies[0].nonce;
  const chainId = user.data.discord_ohmies[0].chainId;

  // Recover the address that corresponds to this pair nonce / signature,
  // and check if it matches the one the user claims to have.
  console.log("Fetched nonce:", nonce);
  console.log("Signature:", signature);
  const recoveredAddress = recoverAddress(nonce, signature);

  if (recoveredAddress.toLowerCase() === publicAddress.toLowerCase()) {
    // If the check passes, return the discord user ID to attribute the role
    return { publicAddress, chainId };
  } else {
    throw new Error("Bad signature.");
  }
};
