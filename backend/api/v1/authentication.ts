import { VercelRequest, VercelResponse } from "@vercel/node";
import * as jwt from "jsonwebtoken";
import { getAuthenticationChallenge, authenticate } from "../../lib/auth";
import { assignRole } from "../../lib/discord";
// import checkAddressTokens from '../../lib/etherscan';
import { hasuraRequest } from "../../lib/hasura";
import { tokensOwned } from "../../lib/fetchBalances";
import { SET_USER_VERIFIED_TOKENS, SET_USER_VERIFIED_AUTHSTATUS } from "../../graphql/user";
import { CHAIN_IDS_DEVELOPMENT, CHAIN_IDS_PRODUCTION, MINIMUM_OHM_EQUIV_AUTH } from "../../config";

const JWT_EXPIRED_ERROR = "Your token has expired. Call the verification command on Discord again to get a new one.";
const JWT_INVALID_ERROR =
  "Something's wrong with your token. Call the verification command on Discord again to get a new one.";

var supportedChainIds = CHAIN_IDS_DEVELOPMENT;

const vercelEnv = process.env.VERCEL_ENV;
if (vercelEnv === "production") {
  console.log("VERCEL_ENV is production: restricting chain data to mainnet");
  supportedChainIds = CHAIN_IDS_PRODUCTION;
}

const auth = async (request: VercelRequest, response: VercelResponse) => {
  if (request.method === "OPTIONS") {
    response.status(200).end();
    return;
  }
  /**
   * GET /api/v1/authentication
   *
   * Returns a nonce given a public address, chain ID, and user JWT token
   */
  if (request.method == "GET") {
    let discordUserId;
    try {
      const address: string = request.query.address as string;
      const chainId: number = parseInt(request.query.chainId as string);
      const userIdToken: string = request.query.userIdToken as string;

      const decoded = jwt.verify(userIdToken, process.env.JWT_SECRET as string) as any;
      discordUserId = decoded.userId as string;

      // Stop immediately case the chain ID is not supported
      if (!supportedChainIds.includes(chainId)) {
        response.status(400).send({ error: `Chain with id ${chainId} is not supported.` });
        return;
      }

      // Get a nonce given an address. This will save the
      // pair nonce/address in the DB for later retrieval
      const nonce = await getAuthenticationChallenge(address, discordUserId, chainId);

      response.status(200).send({ nonce });
    } catch (e) {
      const error = e as Error;
      let errorMessage: string;
      if (error instanceof jwt.TokenExpiredError) errorMessage = JWT_EXPIRED_ERROR;
      else if (error instanceof jwt.JsonWebTokenError) errorMessage = JWT_INVALID_ERROR;
      else errorMessage = error.message;
      console.log(`/api/v1/authentication GET error: ${errorMessage} (discordUserId: ${discordUserId})`);
      console.log(`Stack trace:\n${error.stack}`);
      response.status(500).send({ error: errorMessage });
    }
  } else if (request.method == "POST") {
    /**
     * POST /api/v1/authentication
     *
     * If signature provided matches claimed address + nonce, and address owns tokens, user gets Discord role.
     */

    let discordUserId;
    try {
      const { body } = request;
      const userIdToken: string = body.userIdToken;
      const signature: string = body.signature;

      const decoded = jwt.verify(userIdToken, process.env.JWT_SECRET as string) as any;
      discordUserId = decoded.userId as string;

      // Throws in case of invalid signature
      const { address, chainId } = await authenticate(discordUserId, signature);
      // If address validation was successful, check whether the user owns an amount tokens
      // above minimum threshold for OHM equivalent
      const tokens = await tokensOwned(address, chainId, MINIMUM_OHM_EQUIV_AUTH);
      // Write to DB token ownership status. Note: if a user tries to authenticate with the same
      // address in a different chain, this will replace the previous state
      await hasuraRequest(SET_USER_VERIFIED_TOKENS, { discordUserId, tokens });
      if (tokens.length > 0) {
        // Assign discord role
        const { assignedRole } = await assignRole(
          process.env.DISCORD_SERVER_ID as string,
          process.env.DISCORD_ROLE_ID as string,
          discordUserId,
          address,
          chainId,
          tokens
        );
        if (!assignedRole) throw Error("There's been an error assigning the role on Discord.");
        await hasuraRequest(SET_USER_VERIFIED_AUTHSTATUS, { discordUserId, authStatus: "AUTH_SUCCESS" });
        // Return success message
        response.status(200).send({ userOwnsTokens: true });
      } else {
        // Return message saying that the user doesn't own any tokens
        response.status(400).send({ error: `You must own at least the equivalent to ${MINIMUM_OHM_EQUIV_AUTH} OHM.` });
      }
    } catch (e) {
      await hasuraRequest(SET_USER_VERIFIED_AUTHSTATUS, { authStatus: "AUTH_ERROR" });
      const error = e as Error;
      let errorMessage: string;
      if (error instanceof jwt.TokenExpiredError) errorMessage = JWT_EXPIRED_ERROR;
      else if (error instanceof jwt.JsonWebTokenError) errorMessage = JWT_INVALID_ERROR;
      else errorMessage = error.message;
      console.log(`/api/v1/authentication POST error: ${errorMessage} (discordUserId: ${discordUserId})`);
      console.log(`Stack trace:\n${error.stack}`);
      response.status(500).send({ error: errorMessage });
    }
  }
};

export default auth;
