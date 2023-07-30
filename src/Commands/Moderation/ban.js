const { SlashCommandBuilder, ChatInputCommandInteraction, Client, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Ban someone from the server and any alts they may create!')
    .addUserOption((opt) =>
        opt.setName('member')
        .setDescription('The member you want to ban! (must be from this server)')
        .setRequired(true)
    )
    .addStringOption((opt) =>
        opt.setName('reason')
        .setDescription('The reason for banning the user!')
        .setMaxLength(2048)
    )
    .addBooleanOption((opt) =>
        opt.setName('softban')
        .setDescription('Are you softbanning the user?')
    ),

    /**
     * 
     * @param {ChatInputCommandInteraction} interaction
     * @param {Client} client
     */

    async execute(interaction, client) {
        const { options, guild, channel } = interaction;

        const date = new Date();
        const nowms = date.getTime();

        const discordms = Math.round(nowms / 1000);

        const user = options.getUser('member');
        await user.fetch();

        const reason = options.getString('reason') || "No reason.";
        const softban = options.getBoolean('softban') || false;

        const member = guild.members.cache.get(user.id);
        if(!member) throw "That member is not in this server.";

        if(member.id === interaction.user.id) throw "You cannot ban yourself.";
        if(member.roles.highest.position >= guild.members.me.roles.highest.position) throw "I cannot ban someone with a higher role position than me.";
        if(!guild.members.me.permissions.has('BanMembers')) throw "I do not have the permission to Ban Members.";
        if(member.permissions.has('Administrator') && member.roles.highest.position >= guild.members.me.roles.highest.position) throw "I cannot ban an Administrator if they have a higher role than me.";

        if(member.bannable) {
            if(softban === false) {
                await member.ban({ reason: reason });
            } else if (softban === true) {
                try {
                    await member.ban({ reason: reason, deleteMessageSeconds: 1209600 });

                    interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                            .setTitle(`✅ User banned successfully`)
                            .setDescription(`The user <@${user.id}> (ID:${user.id}) has been banned successfully.`)
                            .setColor('Green')
                            .setFooter({ text: `Moderation action executed` })
                        ], ephemeral: true
                    });

                    try {
                        user.send({
                            embeds: [
                                new EmbedBuilder()
                                .setTitle(`You have been banned.`)
                                .setDescription(`You have been banned from ${guild.name} by ${interaction.user.tag}.\nReason: ${reason}\nDate banned: <t:${discordms}:d>`)
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
            }
        } else throw "That member is not bannable by me or the server.";
    }
}