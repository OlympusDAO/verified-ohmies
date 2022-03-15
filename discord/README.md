# Verified Ohmies (Discord)

This directory contains the Discord commands for Verified Ohmies.

The purpose of this back-end infrastructure is:

1. Communicate with the Discord API to create, sync, and reply to Discord commands.

## Endpoints

This back-end infrastructure is composed by one API endpoint, which can be found under `api/v1`:

- `command-interactions.ts` - This is the endpoint that talks with the Discord API. It's responsible for syncing all the commands listed under `commands/` and replying to them every time a user calls a command on Discord.

## Discord

Use the same credentials as the Discord bot and application created for the `backend` sub-project.

## Continuous Deployment

GitHub Actions is used to deploy to Vercel the slash commands as a serverless function.

The following secrets need to be defined in the GitHub repo in order for continuous deployment to be successful:

Vercel:

- `VERCEL_ORG_ID`: The Vercel org ID
- `VERCEL_DISCORD_PROJECT_ID`: The Vercel project ID
- `VERCEL_TOKEN`:

### Secrets

The following secrets need to be defined in Vercel in order for continuous deployment to be successful:

- `DISCORD_APP_ID`
- `DISCORD_BOT_TOKEN`
- `DISCORD_PUBLIC_KEY`
- `JWT_SECRET`: the JWT secret shared between the backend and discord. See the `backend/README.md` file for information.
- `JWT_EXPIRATION_TIME`: Recommended: 1d
- `FRONTEND_URL`: copy manually from Vercel or the GitHub Actions output

A single secret can have different values in different environments (production, preview and development). It is recommended to have different values in production.

### Latest Deployment URL

While each deployment has a unique URL, there is a URL that reflects the **latest** deployment.

To access this, visit the page of a deployment. Under the `domains` section, hover over the `+1` button and copy the URL that appears. It is generally in the format of `<project name>-git-<branch name>-<user name>.vercel.app`.

### Set Discord Interactions URL

After deployment, the endpoint URL needs to be manually added to the Discord application created earlier. To set this:

1. Visit the applications in the developer portal: <https://discord.com/developers/applications>
2. Select the app created
3. Select "General Information" in the sidebar
4. Enter the domain in the "Interactions Endpoint URL" field, in the format: `https://<deployment>.vercel.app/api/command-interactions`
5. Click "Save Changes".

If Discord was able to successfuly ping our server you'll get a message saying "All your edits have been carefully recorded" at the top of the screen.

Now, the previous two steps serve to sync the Discord commands and tell Discord where our back-end is. This back-end endpoint which interacts with Discord will only serve to generate the URL with the JWT for authentication.
