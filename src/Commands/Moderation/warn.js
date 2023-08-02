const { SlashCommandBuilder, ChatInputCommandInteraction, Client, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const warnings = require('../../Models/warnings');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Moderate members with warnings!')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addSubcommand((sub) =>
        sub.setName('add')
        .setDescription('Add a warning to a user!')
        .addUserOption((opt) =>
            opt.setName('user')
            .setDescription('The user you want to add a warning to!')
            .setRequired(true)
        )
        .addStringOption((opt) =>
            opt.setName('reason')
            .setDescription('The reason for warning the user!')
            .setMaxLength(2048)
        )
    )
    .addSubcommand((sub) =>
        sub.setName('remove')
        .setDescription('Remove a warning using its ID!')
        .addStringOption((opt) =>
            opt.setName('id')
            .setDescription('The ID of the warning!')
            .setRequired(true)
            .setMaxLength(12)
        )
    )
    .addSubcommand((sub) =>
        sub.setName('list')
        .setDescription('List all warnings given to a specific user!')
        .addUserOption((opt) =>
            opt.setName('user')
            .setDescription('The user whose warnings you want to check!')
            .setRequired(true)
        )
    )
    .addSubcommand((sub) =>
        sub.setName('info')
        .setDescription('Get information on a warning using its ID.')
        .addStringOption((opt) =>
            opt.setName('id')
            .setDescription('The ID of the warning.')
            .setRequired(true)
            .setMaxLength(12)
        )
    )
    .addSubcommand((sub) =>
        sub.setName('clear')
        .setDescription('Clear all warnings off of a user.')
        .addUserOption((opt) =>
            opt.setName('user')
            .setDescription('The user you want to clear of their warnings.')
            .setRequired(true)
        )
    ),

    /**
     * 
     * @param {ChatInputCommandInteraction} interaction
     * @param {Client} client
     */

    async execute(interaction, client) {
        const { guild, options } = interaction;

        const sub = options.getSubcommand();

        const user = options.getUser('user') || null;
        const reason = options.getString('reason') || "No reason.";
        const id = options.getString('id') || "";

        const date = new Date();
        const ms = date.getTime();

        const discordms = Math.round(ms / 1000);

        switch(sub) {
            case 'add': {
                const member = await guild.members.cache.get(user.id);
                if(!member) throw "That user is not in this server.";

                await warnings.create({
                    Guild: guild.id,
                    IssuedMS: ms,
                    Moderator: interaction.user.id,
                    Reason: reason,
                    User: member.id
                });

                interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                        .setDescription(`✅ | Warning issued to ${member.user.tag}\nReason: **${reason}**`)
                        .setColor('Blurple')
                    ], ephemeral: true
                });

                interaction.channel.send({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle(`Warning Issued.`)
                        .setDescription(`A warning has been issued to a server member.`)
                        .addFields(
                            { name: 'Member', value: `<@${member.id}>`, inline: true },
                            { name: 'Moderator', value: `<@${interaction.user.id}>`, inline: true },
                            { name: 'Reason', value: `${reason}`, inline: true }
                        )
                        .setColor('Orange')
                        .setFooter({ text: `Date issued: <t:${discordms}:d>` })
                    ]
                });
            }
            break;

            case 'remove': {
                if(id.length > 12) throw "The ID of the warning cannot be more than 12 characters long.";

                const model = await warnings.findById(id);
                if(!model) throw "A warning with that ID does not exist.";

                await model.deleteOne({ new: true });
                await model.save();

                return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle(`✅ Warning Removed Successfully`)
                        .setDescription(`The warning with ID ${id} has been removed from <@${model.User}>.`)
                        .setColor('Green')
                        .setFooter({ text: `Xenir - Action Performed Successfully`, iconURL: `${client.user.displayAvatarURL()}` })
                    ]
                });
            }
            break;

            case 'list': {
                const allwarns = await warnings.find({ Guild: interaction.guildId, User: user.id });
                if(!allwarns || allwarns.length <= 0) throw "That user has no warnings. Well done!";

                const mappedwarnings = await allwarns.map((warn) => {
                    const discordms = Math.round(warn.IssuedMS / 1000);

                    return `Warning ID: ${warn.id}\nUser: <@${warn.User}> (**ID:${warn.User}**)\nModerator: <@${warn.Moderator}> (**ID:${warn.Moderator}**)\nReason: ${warn.Reason}\nWarning Issued: <t:${discordms}:R>`
                }).join('\n\n');

                return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle(`Listed Warnings For ${user.tag}`)
                        .setDescription(`${mappedwarnings}`)
                        .setColor('Blurple')
                        .setFooter({ text: `Xenir Warning System` })
                    ]
                });
            }
            break;

            case 'info': {
                if(id.length > 12) throw "The ID of the warning cannot be more than 12 characters long.";

                const model = await warnings.findById(id);
                if(!model) throw "A warning with that ID does not exist.";

                const discordms = Math.round(model.IssuedMS / 1000);

                return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle(`Warning Information`)
                        .setDescription(`Below is the information contained in the warning with ID \`${id}\``)
                        .addFields(
                            { name: 'Warning ID', value: `${id}`, inline: true },
                            { name: `User`, value: `<@${model.User}> (**ID:${model.User}**)`, inline: true },
                            { name: `Moderator`, value: `<@${model.Moderator}> (**ID:${model.Moderator}**)`, inline: true },
                            { name: `Guild ID`, value: `${model.Guild}`, inline: true },
                            { name: 'Reason', value: `${model.Reason}`, inline: true },
                            { name: `Date Issued`, value: `<t:${discordms}:d>` }
                        )
                        .setColor('Blurple')
                        .setFooter({ text: `Xenir Warning System` })
                    ]
                })
            }
            break;

            case 'clear': {
                const allwarnings = await warnings.find({ Guild: interaction.guildId, User: user.id });
                if(!allwarnings || allwarnings.length <= 0) throw "This user has no warnings. Well done!";

                const button1 = new ButtonBuilder()
                .setCustomId('confirm')
                .setStyle(ButtonStyle.Primary)
                .setLabel('Confirm ✅')

                const button2 = new ButtonBuilder()
                .setCustomId('deny')
                .setStyle(ButtonStyle.Primary)
                .setLabel('Deny 🚫')

                const row = new ActionRowBuilder()
                .addComponents(button1, button2)

                const msg = await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle(`Confirmation Required.`)
                        .setDescription(`Are you sure you would like to clear **ALL** warnings from this user?\nThis action is not reversible.`)
                        .setColor('Blurple')
                    ], components: [row]
                });

                const collector = await msg.createMessageComponentCollector({ filter: i => i.user.id === interaction.user.id, time: 60000 });

                collector.on('collect', async(results) => {
                    if(results.customId === 'confirm') {
                        await warnings.deleteMany({ Guild: interaction.guildId, User: user.id });

                        if(msg) {
                            return msg.edit({
                                embeds: [
                                    new EmbedBuilder()
                                    .setTitle(`Warnings Cleared Successfully.`)
                                    .setDescription(`The warnings for user ${user} have been cleared.`)
                                    .setColor('Blurple')
                                ]
                            });
                        } else {
                            return interaction.channel.send({
                                embeds: [
                                    new EmbedBuilder()
                                    .setTitle(`Warnings Cleared Successfully.`)
                                    .setDescription(`The warnings for user ${user} have been cleared.`)
                                    .setColor('Blurple')
                                ]
                            });
                        }
                    } else if (results.customId === 'deny') {
                        if(msg) {
                            return msg.edit({
                                embeds: [
                                    new EmbedBuilder()
                                    .setTitle(`Warning Clear Request Denied.`)
                                    .setDescription(`The warnings for ${user} have not been cleared due to being denied authorisation.`)
                                    .setColor('Blurple')
                                ]
                            });
                        } else {
                            return interaction.channel.send({
                                embeds: [
                                    new EmbedBuilder()
                                    .setTitle(`Warning Clear Request Denied.`)
                                    .setDescription(`The warnings for ${user} have not been cleared due to being denied authorisation.`)
                                    .setColor('Blurple')
                                ]
                            });
                        }
                    } else {
                        if(msg) {
                            return msg.edit({
                                embeds: [
                                    new EmbedBuilder()
                                    .setTitle(`Unknown Interaction.`)
                                    .setDescription(`An unknown interaction has been entered that I do not recognise. Please try again.`)
                                    .setColor('Blurple')
                                ]
                            });
                        } else {
                            return interaction.channel.send({
                                embeds: [
                                    new EmbedBuilder()
                                    .setTitle(`Unknown Interaction.`)
                                    .setDescription(`An unknown interaction has been entered that I do not recognise. Please try again.`)
                                    .setColor('Blurple')
                                ]
                            });
                        }
                    }
                });

                collector.on('end', async() => {
                    if(msg) {
                        return msg.edit({
                            embeds: [
                                new EmbedBuilder()
                                .setTitle(`Confirmation Request Expired.`)
                                .setDescription(`The confirmation for this message has expired. Please request another /warn clear.`)
                                .setColor('Red')
                            ]
                        });
                    } else {
                        return interaction.channel.send({
                            embeds: [
                                new EmbedBuilder()
                                .setTitle(`Confirmation Request Expired.`)
                                .setDescription(`The confirmation for this message has expired. Please request another /warn clear.`)
                                .setColor('Red')
                            ]
                        });
                    }
                })
            }
            break;
        }
    }
}