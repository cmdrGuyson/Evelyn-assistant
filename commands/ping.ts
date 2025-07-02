import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

export default {
  data: new SlashCommandBuilder().setName("ping").setDescription("Check the bot's latency"),
  cooldown: 10,
  execute(interaction: ChatInputCommandInteraction) {
    interaction
      .reply({ content: `🏓 Pong! The round trip took ${Math.round(interaction.client.ws.ping)}ms.`, flags: 64 })
      .catch(console.error);
  }
};
