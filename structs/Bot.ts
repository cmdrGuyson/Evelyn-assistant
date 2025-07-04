import {
  ApplicationCommandDataResolvable,
  ChatInputCommandInteraction,
  Client,
  Collection,
  Events,
  Interaction,
  REST,
  Routes,
  Snowflake,
  InteractionResponseType,
  Message,
  ChannelType
} from "discord.js";
import { readdirSync } from "fs";
import { join } from "path";

import { Command } from "../interfaces/Command";
import { checkPermissions, PermissionResult } from "../utils/checkPermissions";
import { config } from "../utils/config";
import { MissingPermissionsException } from "../utils/MissingPermissionsException";
import { mastraAgent } from "./MastraAgent";

export class Bot {
  public readonly prefix = "/";
  public commands = new Collection<string, Command>();
  public slashCommands = new Array<ApplicationCommandDataResolvable>();
  public slashCommandsMap = new Collection<string, Command>();
  public cooldowns = new Collection<string, Collection<Snowflake, number>>();

  public constructor(public readonly client: Client) {
    this.client.login(config.TOKEN);

    this.client.on("ready", () => {
      console.log(`✅ ${this.client.user!.username} is online`);

      // Set bot presence to online
      this.client.user!.setPresence({
        activities: [{ name: "DM me to chat!" }],
        status: "online"
      });

      this.registerSlashCommands();
    });

    this.client.on("warn", (info) => console.log(info));
    this.client.on("error", console.error);

    this.onInteractionCreate();
    this.onMessageCreate();
  }

  private async registerSlashCommands() {
    const rest = new REST({ version: "9" }).setToken(config.TOKEN);

    const commandFiles = readdirSync(join(__dirname, "..", "commands")).filter((file) => !file.endsWith(".map"));

    for (const file of commandFiles) {
      const command = await import(join(__dirname, "..", "commands", `${file}`));

      this.slashCommands.push(command.default.data);
      this.slashCommandsMap.set(command.default.data.name, command.default);
    }

    await rest.put(Routes.applicationCommands(this.client.user!.id), { body: this.slashCommands });
  }

  private async onInteractionCreate() {
    this.client.on(Events.InteractionCreate, async (interaction: Interaction): Promise<any> => {
      if (!interaction.isChatInputCommand()) return;

      const command = this.slashCommandsMap.get(interaction.commandName);

      if (!command) return;

      if (!this.cooldowns.has(interaction.commandName)) {
        this.cooldowns.set(interaction.commandName, new Collection());
      }

      const now = Date.now();
      const timestamps: any = this.cooldowns.get(interaction.commandName);
      const cooldownAmount = (command.cooldown || 1) * 1000;

      if (timestamps.has(interaction.user.id)) {
        const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;

        if (now < expirationTime) {
          const timeLeft = (expirationTime - now) / 1000;
          return interaction.reply({
            content: `Please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${interaction.commandName}\` command.`,
            flags: 64 // Ephemeral flag
          });
        }
      }

      timestamps.set(interaction.user.id, now);
      setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

      try {
        const permissionsCheck: PermissionResult = await checkPermissions(command, interaction);

        if (permissionsCheck.result) {
          command.execute(interaction as ChatInputCommandInteraction);
        } else {
          throw new MissingPermissionsException(permissionsCheck.missing);
        }
      } catch (error: any) {
        console.error(error);

        if (error.message.includes("permissions")) {
          interaction.reply({ content: error.toString(), flags: 64 }).catch(console.error);
        } else {
          interaction
            .reply({ content: "There was an error while executing this command!", flags: 64 })
            .catch(console.error);
        }
      }
    });
  }

  private async onMessageCreate() {
    console.log("Setting up messageCreate event listener...");

    this.client.on(Events.MessageCreate, async (message: Message): Promise<void> => {
      console.log("📨 Message received:", {
        content: message.content,
        author: message.author.username,
        channelType: message.channel.type,
        isDM: message.channel.type === ChannelType.DM,
        isPartial: message.partial
      });

      // Handle partial messages
      if (message.partial) {
        try {
          await message.fetch();
          console.log("✅ Partial message fetched");
        } catch (error) {
          console.error("❌ Failed to fetch partial message:", error);
          return;
        }
      }

      // Only respond to DM messages
      if (message.channel.type !== ChannelType.DM) {
        console.log("❌ Not a DM, ignoring");
        return;
      }

      console.log("✅ Processing DM message...");

      // Ignore messages from the bot itself
      if (message.author.id === this.client.user?.id) {
        return;
      }

      // Ignore messages that start with the command prefix
      if (message.content.startsWith(this.prefix)) {
        return;
      }

      try {
        // Show typing indicator
        await message.channel.sendTyping();

        // Generate response using Mastra agent
        const response = await mastraAgent.generate(
          [
            {
              role: "user",
              content: message.content
            }
          ],
          {
            resourceId: message.author.id, // Discord user ID
            threadId: message.channel.id // Discord channel or thread ID
          }
        );

        // Send the response using Discord.js reply method
        await message.reply(response.text);
      } catch (error) {
        console.error("Error processing DM:", error);

        try {
          await message.reply("Sorry, I'm having trouble processing your message right now. Please try again later.");
        } catch (sendError) {
          console.error("Failed to send error message:", sendError);
        }
      }
    });

    console.log("✅ MessageCreate event listener set up!");
  }
}
