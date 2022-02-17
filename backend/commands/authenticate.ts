import { SlashCommand, SlashCreator, CommandContext } from "slash-create";
import jwt from "jsonwebtoken";
// import { CHAINS } from "../constants/constants"

export default class AuthCommand extends SlashCommand {
  constructor(creator: SlashCreator) {
    super(creator, {
      name: "verified",
      description: "🔑 Verify yourself as an Ohmie.",
      /*
      options: [
        {
          type: CommandOptionType.STRING,
          name: "chain",
          description: "The chain where your tokens are.",
          required: true,
          // Note: an option holds a maximum of 25 choices
          choices: CHAINS,
        },
      ]
      */
    });
  }

  async run(ctx: CommandContext) {
    // const chain = ctx.options["chain"]
    const token = jwt.sign(
      { userId: ctx.user.id, username: ctx.user.username }, // , chain },
      process.env.JWT_SECRET as string,
      { expiresIn: process.env.JWT_EXPIRATION_TIME }
    );

    // See all the message options here:
    // https://slash-create.js.org/#/docs/main/v4.0.1/typedef/MessageOptions
    ctx.send(`${process.env.FRONTEND_URL}/?id=${token}`, {
      ephemeral: true,
    });
  }
}
