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
import { Logger } from "./Logger";

export class Bot {
  public readonly prefix = "/";
  public commands = new Collection<string, Command>();
  public slashCommands = new Array<ApplicationCommandDataResolvable>();
  public slashCommandsMap = new Collection<string, Command>();
  public cooldowns = new Collection<string, Collection<Snowflake, number>>();

  public constructor(public readonly client: Client) {
    this.client.login(config.TOKEN);

    this.client.on("ready", () => {
      Logger.log({ type: "BOT", msg: `${this.client.user!.username} is online and ready!` });

      // Set bot presence to online
      this.client.user!.setPresence({
        activities: [{ name: "DM me to chat!" }],
        status: "online"
      });

      this.registerSlashCommands();
    });

    this.client.on("warn", (info) => Logger.info({ type: "BOT", msg: `Discord.js warning: ${info}` }));
    this.client.on("error", (error) => Logger.error({ type: "BOT", err: `Discord.js error: ${error}` }));

    this.onInteractionCreate();
    this.onMessageCreate();
  }

  private async registerSlashCommands() {
    Logger.info({ type: "BOT", msg: "Starting slash command registration..." });

    const rest = new REST({ version: "9" }).setToken(config.TOKEN);

    const commandFiles = readdirSync(join(__dirname, "..", "commands")).filter((file) => !file.endsWith(".map"));

    Logger.debug({ type: "BOT", msg: `Found ${commandFiles.length} command files: ${commandFiles.join(", ")}` });

    for (const file of commandFiles) {
      const command = await import(join(__dirname, "..", "commands", `${file}`));

      this.slashCommands.push(command.default.data);
      this.slashCommandsMap.set(command.default.data.name, command.default);

      Logger.debug({ type: "BOT", msg: `Registered command: ${command.default.data.name}` });
    }

    await rest.put(Routes.applicationCommands(this.client.user!.id), { body: this.slashCommands });
    Logger.log({ type: "BOT", msg: `Successfully registered ${this.slashCommands.length} slash commands` });
  }

  private async onInteractionCreate() {
    this.client.on(Events.InteractionCreate, async (interaction: Interaction): Promise<any> => {
      if (!interaction.isChatInputCommand()) return;

      const command = this.slashCommandsMap.get(interaction.commandName);

      if (!command) {
        Logger.info({ type: "BOT", msg: `Unknown command requested: ${interaction.commandName}` });
        return;
      }

      Logger.info({
        type: "BOT",
        msg: `Command executed: ${interaction.commandName} by ${interaction.user.username} (${interaction.user.id})`
      });

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
          Logger.debug({
            type: "BOT",
            msg: `Cooldown active for ${interaction.user.username} on command ${interaction.commandName}. Time left: ${timeLeft.toFixed(1)}s`
          });
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
          Logger.debug({
            type: "BOT",
            msg: `Executing command ${interaction.commandName} for ${interaction.user.username}`
          });
          command.execute(interaction as ChatInputCommandInteraction);
        } else {
          Logger.warn({
            type: "BOT",
            msg: `Permission denied for ${interaction.user.username} on command ${interaction.commandName}. Missing: ${permissionsCheck.missing.join(", ")}`
          });
          throw new MissingPermissionsException(permissionsCheck.missing);
        }
      } catch (error: any) {
        Logger.error({
          type: "BOT",
          err: `Error executing command ${interaction.commandName} for ${interaction.user.username}: ${error}`
        });

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
    Logger.info({ type: "BOT", msg: "Setting up messageCreate event listener..." });

    this.client.on(Events.MessageCreate, async (message: Message): Promise<void> => {
      Logger.debug({
        type: "BOT",
        msg: `Message received from ${message.author.username} (${message.author.id}): "${message.content}"`
      });

      // Handle partial messages
      if (message.partial) {
        try {
          await message.fetch();
          Logger.debug({ type: "BOT", msg: "Partial message fetched successfully" });
        } catch (error) {
          Logger.error({ type: "BOT", err: `Failed to fetch partial message: ${error}` });
          return;
        }
      }

      // Only respond to DM messages
      if (message.channel.type !== ChannelType.DM) {
        Logger.debug({ type: "BOT", msg: "Message is not a DM, ignoring" });
        return;
      }

      Logger.info({ type: "BOT", msg: `Processing DM from ${message.author.username} (${message.author.id})` });

      // Ignore messages from the bot itself
      if (message.author.id === this.client.user?.id) {
        Logger.debug({ type: "BOT", msg: "Message is from bot itself, ignoring" });
        return;
      }

      // Ignore messages that start with the command prefix
      if (message.content.startsWith(this.prefix)) {
        Logger.debug({ type: "BOT", msg: "Message starts with command prefix, ignoring" });
        return;
      }

      try {
        // Show typing indicator
        await message.channel.sendTyping();
        Logger.debug({ type: "BOT", msg: "Sent typing indicator" });

        Logger.info({
          type: "AGENT",
          msg: `Starting agent generation for user ${message.author.username} (${message.author.id})`
        });

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

        Logger.log({
          type: "AGENT",
          msg: `Agent response generated for user ${message.author.username}. Response length: ${response.text.length} characters`
        });

        // Log tool usage if any
        if (response.toolCalls && response.toolCalls.length > 0) {
          Logger.info({
            type: "AGENT",
            msg: `Agent used ${response.toolCalls.length} tool(s): ${response.toolCalls.map((tc) => tc.toolName).join(", ")}`
          });

          for (const toolCall of response.toolCalls) {
            Logger.debug({
              type: "AGENT",
              msg: `Tool call: ${toolCall.toolName} with args: ${JSON.stringify(toolCall.args)}`
            });
          }
        }

        // Send the response using Discord.js reply method
        await message.reply(response.text);
        Logger.log({ type: "BOT", msg: `Response sent to user ${message.author.username} successfully` });
      } catch (error) {
        Logger.error({ type: "BOT", err: `Error processing DM from ${message.author.username}: ${error}` });

        try {
          await message.reply("Sorry, I'm having trouble processing your message right now. Please try again later.");
          Logger.info({ type: "BOT", msg: `Error message sent to user ${message.author.username}` });
        } catch (sendError) {
          Logger.error({
            type: "BOT",
            err: `Failed to send error message to ${message.author.username}: ${sendError}`
          });
        }
      }
    });

    Logger.log({ type: "BOT", msg: "MessageCreate event listener set up successfully!" });
  }
}
