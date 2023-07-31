const { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('support')
    .setDescription('Need support? Run this command!'),

    /**
     * 
     * @param {ChatInputCommandInteraction} interaction
     */

    async execute(interaction) {
        return interaction.reply({
            embeds: [
                new EmbedBuilder()
                .setTitle(`Xenir Support Server!`)
                .setDescription(`Need help with the source code of this bot or coding support in general?\nJoin the Xenir support server [here!](https://discord.gg/zU5X7KsAbC)`)
                .setColor('Blurple')
                .setFooter({ text: `Xenir Support`, iconURL: `${interaction.guild.members.me.displayAvatarURL()}` })
            ]
        })
    }
}