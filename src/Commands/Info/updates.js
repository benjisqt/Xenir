const { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } = require('discord.js');
const git = require('simple-git').default;
const commit = require('git-commit-count');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('updates')
    .setDescription('Get news about the latest release of Xenir, straight from the source!'),

    /**
     * 
     * @param {ChatInputCommandInteraction} interaction
     */

    async execute(interaction) {
        commit();
        const count = commit('benjisqt/Xenir');
        const cont = count / 10;
        const commitcount = `Alpha 1.${cont}`
        const check = await git().log({ maxCount: 1 });

        return interaction.reply({
            embeds: [
                new EmbedBuilder()
                .setTitle(`Newest Update (${commitcount}) release notes!`)
                .setDescription(`${check.latest.message}\n\nVisit the GitHub page [here](https://www.github.com/benjisqt/Xenir)!`)
                .setColor('Blurple')
                .setThumbnail(interaction.guild.members.me.displayAvatarURL({ size: 1024 }))
            ]
        });
    }
}