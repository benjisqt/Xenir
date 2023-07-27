const { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('userinfo')
    .setDescription('Get information about a user!')
    .addUserOption((opt) =>
        opt.setName('user')
        .setDescription('The user you want to get information on')
    ),

    /**
     * 
     * @param {ChatInputCommandInteraction} interaction
     */

    async execute(interaction) {
        const { options, guild } = interaction;

        const user = await options.getUser('user') || interaction.user;
        await user.fetch();
        const member = guild.members.cache.get(user.id);
        if(!member) throw "That member is not in this server.";

        let roles = [];
        let rolecount;

        if(member.roles.cache.size <= 0) {
            roles.push('No Roles.');
            rolecount = 0;
        } else {
            member.roles.cache.forEach((role) => {
                roles.push(`<@&${role.id}>`);
            });
            rolecount = member.roles.cache.size;
        }

        let keypermissionsuser = [];

        let keypermissions = [
            'Administrator',
            'ManageGuild',
            'ManageRoles',
            'ManageChannels',
            'ManageMessages',
            'ManageWebhooks',
            'ManageNicknames',
            'ManageGuildExpressions',
            'ManageEmojisAndStickers',
            'KickMembers',
            'BanMembers',
            'ModerateMembers',
            'MentionEveryone',
        ];

        keypermissions.forEach((permission) => {
            if(member.permissions.has(permission)) keypermissionsuser.push(permission);
        });

        return interaction.reply({
            embeds: [
                new EmbedBuilder()
                .setAuthor({ name: `${member.user.tag}`, iconURL: `${member.displayAvatarURL()}` })
                .setTitle(`User Information`)
                .addFields(
                    { name: 'Joined Server', value: `<t:${Math.round(member.joinedTimestamp / 1000)}:R> (<t:${Math.round(member.joinedTimestamp / 1000)}:D>)`, inline: true },
                    { name: 'Account Registered', value: `<t:${Math.round(user.createdTimestamp / 1000)}:R> (<t:${Math.round(user.createdTimestamp / 1000)}:D>)`, inline: true },
                    { name: `Roles (${rolecount})`, value: `${roles.join(' ')}` },
                    { name: 'Key Permissions', value: `${keypermissionsuser.join(', ')}` }
                )
                .setDescription(`<@${member.id}>`)
                .setImage(user.bannerURL({ size: 4096 }))
                .setThumbnail(member.displayAvatarURL({ size: 4096 }))
                .setColor(user.accentColor || 'Blurple')
                .setFooter({ text: `ID: ${member.id}` })
            ]
        })
    }
}