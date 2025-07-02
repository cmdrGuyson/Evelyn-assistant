import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder
} from "discord.js";

export default {
  data: new SlashCommandBuilder().setName("invite").setDescription("Get the bot's invite link"),
  execute(interaction: ChatInputCommandInteraction) {
    const inviteEmbed = new EmbedBuilder().setTitle("Invite me to your server!");

    // return interaction with embed and button to invite the bot
    const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
      new ButtonBuilder()
        .setLabel("Invite")
        .setStyle(ButtonStyle.Link)
        .setURL(
          `https://discord.com/api/oauth2/authorize?client_id=${
            interaction.client.user!.id
          }&permissions=8&scope=bot%20applications.commands`
        )
    );

    return interaction.reply({ embeds: [inviteEmbed], components: [actionRow] }).catch(console.error);
  }
};
