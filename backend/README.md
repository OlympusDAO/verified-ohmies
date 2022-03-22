# Verified Ohmies (back-end)

This is the back-end infrastructure for Verified Ohmies.

The purpose of this back-end infrastructure is twofold:

1. Handle the Ethereum wallet authentication-flow coming from the front-end and verify whether the authenticated address owns Olympus tokens.
2. Retrieve Olympus token balances for the address the user has selected on their wallet, and pass them to the front-end.

# Contents

- [Endpoints](#endpoints)
- [Requirements](#requirements)
- [Setup](#setup)
- [Deployment](#deployment)
- [Future improvements](#future-improvements)

### Endpoints

This back-end infrastructure is composed by two different API endpoints, which can be found under `api/v1`:

- `authentication.ts` - This endpoint handles the Ethereum wallet authentication-flow coming from the front-end. This flow includes the following stages:
  1. Once the user clicks the "Authenticate" button in the front-end, they send the following arguments to this endpoint through a `GET` request:
     - The JWT that was passed to them in the URL they received from calling the verification command on Discord. This JWT contains the Discord user ID (this is passed inside a JWT so that a user can only authenticate themselves and not someone else).
     - The public address that the user selected on their wallet.
     - The ID of the chain the user wants to authenticate on.
  2. Once the back-end receives the arguments from step 1., a nonce is generated for the user to sign and all the data (Discord user ID, public address, chain ID, and nonce) is stored in Hasura.
  3. The back-end replies to the user's `GET` request with the nonce generated in the previous step.
  4. The user signs the nonce with their wallet and sends the signature through a `POST` request.
  5. On the back-end we then fetch from Hasura the nonce that was given to this specific Discord user ID. Since we now have the signature and the nonce, we can validate that the corresponding public address for this signature/nonce pair matches the one the user claims to own.
  6. If the authentication in the previous step was successful, we use the Covalent API to verify whether that address owns Olympus tokens.
  7. Case the address owns Olympus tokens, the Discord API is called to attribute a role to this user.
- `balances.ts` - This endpoint receives the public address that the user has selected in their wallet and returns the balances of the Olympus tokens allowed for authentication, so that the user knows whether they own allowed tokens (only gOHM in the first version) before they click the authentication button.

### Requirements

- A Discord account and a server where you're an administrator
- Vercel account and Vercel CLI
- Node version 14
- An instance of Hasura
- A Covalent API Key

## Setup

### Secrets

To run locally, you can populate a `.env` file manually using `.env.example`.

#### JWT

JWT is used to sign messages sent between the backend and other services.

To generate the JWT secret: `node -e "console.log(require('crypto').randomBytes(256).toString('base64'));"`

### Install dependencies locally

```sh
# To run the project locally
cd root folder of this project
yarn install
vercel dev
```

> Possible build fail as mentioned [here](https://github.com/Snazzah/slash-create-vercel). The error happens because the `discord.js` version required requires Node 16, and Vercel still doesn't have that environment available.

```sh
yarn config set ignore-engines true
yarn install --network-concurrency 1
```

### TODO on Vercel project repo

- Create the same `.env.example` variables on the Vercel project
- Override the project's install command to: `yarn config set ignore-engines true && yarn install --network-concurrency 1` to avoid the error that appears because of the Node version.

### Deployment

Continuous deployment is implemented through Vercel, which handles end-to-end deployment of the entire stack.

> Check on your Discord server whether you now have the command `/verified` there.

> Tips: If you try calling it, the server still won't respond, because you haven't yet told Discord where the Interactions URL is (next step).

### Future Improvements

- Currently only gOHM on Ethereum Mainnet is accepted for verification. For development mode, Rinkeby is also accepted. Add the other tokens and chains.
- Add the possibility for Verified Ohmies to remove their verification and clean their info from the DB.
- Check periodically whether the Ohmies still own OHM tokens and, if not, remove their Discord Role. This could be done using a cron job running every hour, for instance.
- The CORS for the API in `api\v1\authentication` currently allows for any source. Restrict that.
- Restrict permissions to write to hasura using JWT. Example [here](https://github.com/OlympusDAO/olympus-api/blob/develop/lambda/security/tools/checkJWT.ts). Relevant video [here](https://youtu.be/rkN3RQBi_UI?t=546).
- Test suite.
