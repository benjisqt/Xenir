const { SlashCommandBuilder, ChatInputCommandInteraction, Client, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('whoami')
    .setDescription('Get info about me!'),

    /**
     * 
     * @param {ChatInputCommandInteraction} interaction
     * @param {Client} client
     */

    async execute(interaction, client) {
        const { guild } = interaction;

        let roles = [];
        let rolecount;

        if(guild.members.me.roles.cache.size <= 0) {
            roles.push('No Roles.');
            rolecount = 0;
        } else {
            guild.members.me.roles.cache.forEach((role) => {
                roles.push(`<@&${role.id}>`);
            });
            rolecount = guild.members.me.roles.cache.size;
        }

        return interaction.reply({
            embeds: [
                new EmbedBuilder()
                .setTitle(`Who am I? Find out!`)
                .setAuthor({ name: `${client.user.username}`, iconURL: `${client.user.displayAvatarURL()}` })
                .setDescription(`Roles (${rolecount}): ${roles}`)
                .setFields(
                    { name: `Servers using me`, value: `${client.guilds.cache.size}`, inline: true },
                    { name: `Users I'm watching`, value: `${client.users.cache.size}`, inline: true },
                    { name: `Commands I'm holding`, value: `${client.commands.size}`, inline: true },
                    { name: `My amazing developer!`, value: `<@1117933631512518716>`, inline: true },
                    { name: `My GitHub page!`, value: `Check out my code [here](https://www.github.com/benjisqt/Xenir)`, inline: true }
                )
                .setColor(guild.members.me.displayHexColor || "Blurple")
                .setFooter({ text: `My ID: ${client.user.id}` })
            ]
        })
    }
}