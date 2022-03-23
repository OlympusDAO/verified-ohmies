import Discord from "discord.js";
const client = new Discord.Client();

// Note: I'm using Discord.js v12.5.3 because v13 is only compatible with node 16.
// Vercel currently only allows for node 14.

client.login(process.env.DISCORD_BOT_TOKEN);

const waitForClient = () => {
  return new Promise((resolve) => {
    // client.isReady is not available in v12.5.3, so I used uptime
    if (client.uptime == null) {
      client.on("ready", () => {
        resolve(null);
      });
    }
    // If uptime != null, client is ready - resolve immediately
    else {
      resolve(null);
    }
  });
};

export const assignRole = async (
  discordServerId: string,
  discordRoleId: string,
  discordUserId: string,
  address: string,
  chainId: number,
  tokens: string[]
) => {
  await waitForClient();
  let assignedRole = false;
  let sentMessage = false;

  const guild = await client.guilds.fetch(discordServerId);

  const role = await guild.roles.cache.get(discordRoleId);
  if (!role) throw new Error("Discord role ID was invalid: " + discordRoleId);

  const member = await guild.members.fetch(discordUserId);
  await member.roles.add(discordRoleId);
  assignedRole = true;

  // The Discord API will throw an error if the user does not have DMs enabled for non-friends
  // We catch and log it, but don't take any action
  try {
    await member.send(
      `Congrats fren, you're now a verified Ohmie! Ethereum Address: ${address}; Chain ID: ${chainId}; Owned Tokens: ${tokens}`
    );
    sentMessage = true;
  } catch (e) {
    const error = e as Error;
    console.error(
      `assignRole: Unexpected error when sending message to user: ${error.message} (discordUserId: ${discordUserId})`
    );
    console.error(`Stack trace:\n${error.stack}`);
  }

  return { assignedRole, sentMessage };
};

export const revokeRole = async (
  discordServerId: string,
  discordRoleId: string,
  discordUserId: string,
  address: string,
  chainId: number,
  minThreshold: number,
  sendNotificationDM: boolean
) => {
  await waitForClient();
  let revokedRole = false;
  let sentMessage = false;

  const guild = await client.guilds.fetch(discordServerId);
  const member = await guild.members.fetch(discordUserId);
  await member.roles.remove(discordRoleId);
  revokedRole = true;

  if (sendNotificationDM) {
    // The Discord API will throw an error if the user does not have DMs enabled for non-friends
    // We catch and log it, but don't take any action
    try {
      await member.send(
        `Your Verified Ohmies role has been revoked because you don't own tokens amounting to a minimum of ${minThreshold} in address ${address} (Chain ID: ${chainId}).`
      );
      sentMessage = true;
    } catch (e) {
      const error = e as Error;
      console.error(
        `revokeRole: Unexpected error when sending message to user: ${error.message} (discordUserId: ${discordUserId})`
      );
      console.error(`Stack trace:\n${error.stack}`);
    }
  }

  return { revokedRole, sentMessage };
};
