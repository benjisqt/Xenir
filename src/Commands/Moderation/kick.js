const { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kick a member from the server!')
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
    .addUserOption((opt) =>
        opt.setName('member')
        .setDescription('The member you want to kick.')
        .setRequired(true)
    )
    .addStringOption((opt) =>
        opt.setName('reason')
        .setDescription('The reason for kicking the user.')
        .setMaxLength(2048)
    ),

    /**
     * 
     * @param {ChatInputCommandInteraction} interaction
     */

    async execute(interaction) {
        const { options, guild, channel } = interaction;

        const date = new Date();
        const nowms = date.getTime();

        const discordms = Math.round(nowms / 1000);

        const user = options.getUser('member');
        await user.fetch();

        const reason = options.getString('reason') || "No reason.";

        const member = guild.members.cache.get(user.id);
        if (!member) throw "That member is not in this server.";

        if (member.id === interaction.user.id) throw "You cannot kick yourself.";
        if (member.roles.highest.position >= guild.members.me.roles.highest.position) throw "I cannot kick someone with a higher role position than me.";
        if (!guild.members.me.permissions.has('KickMembers')) throw "I do not have the permission to Kick Members.";
        if (member.permissions.has('Administrator') && member.roles.highest.position >= guild.members.me.roles.highest.position) throw "I cannot kick an Administrator if they have a higher role than me.";

        if (member.kickable) {
                try {
                    await member.kick(reason);

                    interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setTitle(`✅ User kicked successfully`)
                                .setDescription(`The user <@${user.id}> (ID:${user.id}) has been kicked successfully.`)
                                .setColor('Green')
                                .setFooter({ text: `Moderation action executed` })
                        ], ephemeral: true
                    });

                    try {
                        user.send({
                            embeds: [
                                new EmbedBuilder()
                                    .setTitle(`You have been kicked.`)
                                    .setDescription(`You have been kicked from ${guild.name} by ${interaction.user.tag}.\nReason: ${reason}\nDate banned: <t:${discordms}:d>`)
                                    .setColor('Orange')
                                    .setFooter({ text: `Moderation action executed` })
                            ]
                        });
                    } catch (err) {
                        return;
                    }
                } catch (err) {
                    throw err;
                }
        } else throw "That member is not bannable by me or the server.";
    }
}