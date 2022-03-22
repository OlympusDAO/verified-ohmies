# Verified Ohmies (Discord)

This directory contains the Discord commands for Verified Ohmies.

The purpose of this back-end infrastructure is:

1. Communicate with the Discord API to create, sync, and reply to Discord commands.

## Endpoints

This back-end infrastructure is composed by one API endpoint, which can be found under `api/v1`:

- `command-interactions.ts` - This is the endpoint that talks with the Discord API. It's responsible for syncing all the commands listed under `commands/` and replying to them every time a user calls a command on Discord.

## Discord

- Create a Discord server if you don't have one already. Create the role you want to give the user after they've authenticated with Ethereum. For example, I named my role `verified`.

> Important: this role must be lower in the hierarchy than the one for the bot you create in the next step, otherwise you'll get a "missing access" error. See [here](https://support.discord.com/hc/en-us/articles/214836687-Role-Management-101) how to move a role up or down in the hierarchy.

- [Set up an application for your bot](https://discordjs.guide/preparations/setting-up-a-bot-application.html#creating-your-bot)
- Select the following boxes in the OAuth2 tab. Open the link marked in red and choose your server to add the bot.

## Continuous Deployment

GitHub Actions is used to deploy to Vercel the slash commands as a serverless function.

### Deployment URL

While each deployment has a unique URL, there is a URL that reflects the **latest** deployment.

The following URLs are static:

- main branch (production): `https://verified-ohmies-discord.vercel.app`
- staging branch: `https://verified-ohmies-discord-staging.vercel.app`
- all others: visit the page of a deployment. Under the `domains` section, hover over the `+1` button and copy the URL that appears.

### Set Interactions URL in Discord

After deployment, the endpoint URL needs to be manually added to the Discord application created earlier. To set this:

1. Visit the applications in the developer portal: <https://discord.com/developers/applications>
2. Select the app created
3. Select "General Information" in the sidebar
4. Enter the domain in the "Interactions Endpoint URL" field, in the format: `https://<domain>/api/command-interactions`
5. Click "Save Changes".

If Discord was able to successfuly ping our server you'll get a message saying "All your edits have been carefully recorded" at the top of the screen.

Now, the previous two steps serve to sync the Discord commands and tell Discord where our back-end is. This back-end endpoint which interacts with Discord will only serve to generate the URL with the JWT for authentication.
