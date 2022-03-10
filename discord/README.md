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

The following secrets need to be defined in the GitHub repo in order for continuous deployment to be successful:

- `DISCORD_APP_ID`
- `DISCORD_BOT_TOKEN`
- `DISCORD_PUBLIC_KEY`
- `JWT_SECRET`
- `JWT_EXPIRATION_TIME`

The following are generated at deployment-time:

- `FRONTEND_URL`
