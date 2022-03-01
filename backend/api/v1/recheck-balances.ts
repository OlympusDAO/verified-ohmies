// ------
// Chronos: this won't scale for Moralis. Initially this was done thinking about the Covalent case
// where the rate limit was 20 parallel/reqs, with no rate limit per minute. Moralis has a rate limit
// of 1500 reqs/min for free account, so the batching methodology won't work for a single lambda call.
//
// New path to follow for this purpose is ERC20 snapshotting directly through a node.
// ------

// - Called through cron job -

// Go through all the registered users in the DB and check whether they still own tokens
// in an amount larger than the minimum threshold. If they don't, their Discord token gets revoked
// and, if `SEND_DM_REVOKE`, they get a notification DM.

/*
import { VercelRequest, VercelResponse } from "@vercel/node";
import { hasuraRequest } from "../../lib/hasura";
import { tokensOwned } from "../../lib/fetchBalances";
import { revokeRole } from "../../lib/discord";
import { GET_AUTH_USERS_BATCH, SET_USER_OWNEDTOKENS, SET_USER_AUTHSTATUS } from "../../graphql/user";
import { MINIMUM_OHM_EQUIV_AUTH, SEND_DM_REVOKE } from "../../config";
import { ChainId } from "../../constants";
import { BalancesAPIError } from "../../lib/chainAPI";

// Number of users to process per batch
// This also determines the number of parallel requests to the API that provides the balances (i.e. Moralis or Covalent)
const N_BATCH_SIZE = 100;

// TODO: Include in the request verification for authorization token that will be
// provided by the cron in Hasura
const balances = async (request: VercelRequest, response: VercelResponse) => {
  var hrStart = process.hrtime();
  // Fetch the users from the DB, with page size equal to `N_BATCH_SIZE`
  var batchNumber = 0;
  // List of the Discord User ID's for which the role has been revoked:
  var revokedDiscordUserIds: string[] = [];
  // Case any error happened during processing of a user, store it
  var errors = {};
  // The number of users for whom the tokens have been successfully fetched and updated
  var nUsersSuccess = 0;
  // The number of users for whom there was an error during processing
  var nUsersError = 0;

  console.log("---- STARTING BALANCES RECHECK ----");

  // Just an arbitrary timestamp in the past to get the first batch through the cursor
  var lastUserCreatedAt = "2000-01-01T00:00:00.00000+00:00";
  while (true) {
    // Fetch users batch
    var _usersBatch = await hasuraRequest(GET_AUTH_USERS_BATCH, {
      limit: N_BATCH_SIZE,
      lastBatchCreatedAt: lastUserCreatedAt,
    });
    _usersBatch = (await _usersBatch.json()) as any;

    // Array of users
    const usersBatch = _usersBatch.data.discord_ohmies;
    // No more users
    if (usersBatch.length === 0) break;

    lastUserCreatedAt = usersBatch[usersBatch.length - 1].created_at;

    // console.log({ lastUserCreatedAt });
    // console.log({ usersBatch });

    console.log(`\n\nProcessing batch ${batchNumber} (number of users: ${usersBatch.length})`);
    console.log("--");

    var hrStartBatch = process.hrtime();
    // Process current batch
    await Promise.all(
      usersBatch.map(async (user: { address: string; chainId: ChainId; discordUserId: string }) => {
        var logMsg = `${user.discordUserId}: `;
        try {
          const ownedTokens = await tokensOwned(user.address, user.chainId, MINIMUM_OHM_EQUIV_AUTH);
          logMsg = logMsg.concat(`Owned tokens = ${JSON.stringify(ownedTokens)}; `);
          logMsg = logMsg.concat(`Outcome = `);

          // Update owned tokens for this user on Hasura
          await hasuraRequest(SET_USER_OWNEDTOKENS, { discordUserId: user.discordUserId, ownedTokens });
          // If user doesn't own tokens anymore
          if (ownedTokens.length === 0) {
            logMsg = logMsg.concat("[REVOKE_ROLE]");
            // Revoke role
            const { revokedRole } = await revokeRole(
              process.env.DISCORD_SERVER_ID as string,
              process.env.DISCORD_ROLE_ID as string,
              user.discordUserId,
              user.address,
              user.chainId,
              MINIMUM_OHM_EQUIV_AUTH,
              SEND_DM_REVOKE
            );
            if (!revokedRole) {
              await hasuraRequest(SET_USER_AUTHSTATUS, {
                discordUserId: user.discordUserId,
                authStatus: "REVOKE_ERROR",
              });
              throw Error("There's been an error revoking the role on Discord.");
            }
            await hasuraRequest(SET_USER_AUTHSTATUS, {
              discordUserId: user.discordUserId,
              authStatus: "REVOKE_SUCCESS",
            });
            // Save the Discord User ID for the users whose role has been revoked
            revokedDiscordUserIds.push(user.discordUserId);
          } else {
            logMsg = logMsg.concat("[KEEP_ROLE]");
          }
          nUsersSuccess++;
        } catch (e) {
          if (e instanceof BalancesAPIError) {
            logMsg = logMsg.concat("Outcome: [BALANCES_API_ERROR]");
          } else {
            logMsg = logMsg.concat("[ERROR]");
          }
          errors[user.discordUserId] = (e as Error).message;
          nUsersError++;
        }
        console.log(logMsg);
      })
    );
    var hrEndBatch = process.hrtime(hrStartBatch);
    console.log(`Took ${hrEndBatch[0]}s ${hrEndBatch[1] / 10 ** 6} ms`);
    console.log(`--`);

    batchNumber++;

    // This means we've reached the last page; break.
    if (usersBatch.length < N_BATCH_SIZE) break;
  }

  console.log("\n\n##############\n\n");

  console.log("--> Statistics");
  console.log(`Number of users successfully processed: ${nUsersSuccess}`);
  console.log(`Number of users for whom an error occurred: ${nUsersError}`);

  console.log("\n\n--> Revoked Discord User ID's:");
  console.log(revokedDiscordUserIds);

  console.log("\n\n--> Errors during processing (discordUserId: message)");
  console.log(JSON.stringify(errors, null, 2));

  var hrEnd = process.hrtime(hrStart);
  response.status(200).json(`Finished, took ${hrEnd[0]}s ${hrEnd[1] / 10 ** 6} ms.`);
};

export default balances;
*/
