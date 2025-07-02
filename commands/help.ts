import { CommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { bot } from "../index";

export default {
  data: new SlashCommandBuilder().setName("help").setDescription("Shows all available commands"),
  async execute(interaction: CommandInteraction) {
    let commands = bot.slashCommandsMap;

    let helpEmbed = new EmbedBuilder()
      .setTitle(`${interaction.client.user!.username} Help`)
      .setDescription("Here are all the available commands:")
      .setColor("#F8AA2A");

    commands.forEach((cmd) => {
      helpEmbed.addFields({
        name: `**${cmd.data.name}**`,
        value: `${cmd.data.description}`,
        inline: true
      });
    });

    helpEmbed.setTimestamp();

    return interaction.reply({ embeds: [helpEmbed] }).catch(console.error);
  }
};
