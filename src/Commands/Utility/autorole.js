const { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const autorole = require('../../Models/autorole');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('autorole')
    .setDescription('Manage the autorole system for your Discord server!')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand((sub) =>
        sub.setName('setup')
        .setDescription('Setup the autorole system!')
        .addRoleOption((opt) =>
            opt.setName('role')
            .setDescription('The role you want to be applied to users')
            .setRequired(true)
        )
    )
    .addSubcommand((sub) =>
        sub.setName('disable')
        .setDescription('Disable the autorole system.')
    )
    .addSubcommand((sub) =>
        sub.setName('addrole')
        .setDescription('Add another role to the autorole system!')
        .addRoleOption((opt) =>
            opt.setName('role')
            .setDescription('The role you want to add.')
            .setRequired(true)
        )
    )
    .addSubcommand((sub) =>
        sub.setName('removerole')
        .setDescription('Remove a role from the autorole system!')
        .addRoleOption((opt) =>
            opt.setName('role')
            .setDescription('The role you want to remove.')
            .setRequired(true)
        )
    ),

    /**
     * 
     * @param {ChatInputCommandInteraction} interaction
     */

    async execute(interaction) {
        const { options, guild } = interaction;
        const role = options.getRole('role') || null;
        const sub = options.getSubcommand();

        switch(sub) {
            case 'setup': {
                const validrole = await guild.roles.cache.get(role.id);
                if(!validrole) throw "That role does not exist in this server.";
                if(validrole.position >= guild.members.me.roles.highest.position) throw "That role has a higher than or equal position to mine, I will be unable to apply that role.";

                const data = await autorole.findOne({ Guild: guild.id });
                if(data) throw "You already have autorole set up!";

                await autorole.create({
                    Guild: guild.id,
                    Roles: [role.id]
                });

                return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle(`Autorole Successfully Setup`)
                        .setDescription(`The autorole system has been set up in this server.\nWhen new members join, they will be given the following role: <@&${validrole.id}>`)
                        .setColor('Green')
                    ]
                });
            }
            break;

            case 'disable': {
                const data = await autorole.findOne({ Guild: guild.id });
                if(!data) throw "The autorole system is already disabled.";

                await autorole.deleteMany({ Guild: interaction.guildId });

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
                        .setDescription(`Are you sure you want to disable the autorole system?\nYou will lose **ALL** of your autoroles and you will have to add them back manually.`)
                        .setColor('Red')
                    ], components: [row]
                });

                const collector = await msg.createMessageComponentCollector({ filter: i => i.user.id === interaction.user.id, time: 60000 });

                collector.on('collect', async(results) => {
                    if(results.customId === 'confirm') {
                        await autorole.deleteMany({ Guild: guild.id });

                        if(msg) {
                            await msg.edit({
                                embeds: [
                                    new EmbedBuilder()
                                    .setTitle(`Autorole System Disabled`)
                                    .setDescription(`The autorole system has been disabled. Any new members that join will not receive any roles.`)
                                    .setColor('Green')
                                ]
                            });
                        } else {
                            await interaction.channel.send({
                                embeds: [
                                    new EmbedBuilder()
                                    .setTitle(`Autorole System Disabled`)
                                    .setDescription(`The autorole system has been disabled. Any new members that join will not receive any roles.`)
                                    .setColor('Green')
                                ]
                            });
                        }
                    } else if (results.customId === 'deny') {
                        if(msg) {
                            await msg.edit({
                                embeds: [
                                    new EmbedBuilder()
                                    .setTitle(`Access Denied.`)
                                    .setDescription(`You have pressed the Deny button, so the operation has been cancelled.`)
                                    .setColor('Red')
                                ]
                            });
                        } else {
                            await interaction.channel.send({
                                embeds: [
                                    new EmbedBuilder()
                                    .setTitle(`Access Denied.`)
                                    .setDescription(`You have pressed the Deny button, so the operation has been cancelled.`)
                                    .setColor('Red')
                                ]
                            });
                        }
                    } else {
                        if(msg) {
                            await msg.edit({
                                embeds: [
                                    new EmbedBuilder()
                                    .setTitle(`Unknown Interaction.`)
                                    .setDescription(`That interaction was unknown.`)
                                    .setColor('Red')
                                ]
                            });
                        } else {
                            await interaction.channel.send({
                                embeds: [
                                    new EmbedBuilder()
                                    .setTitle(`Unknown Interaction.`)
                                    .setDescription(`That interaction was unknown.`)
                                    .setColor('Red')
                                ]
                            });
                        }
                    }
                })
            }
            break;

            case 'addrole': {
                const validrole = await guild.roles.cache.get(role.id);
                if(!validrole) throw "That role does not exist in this server.";
                if(validrole.position >= guild.members.me.roles.highest.position) throw "That role has a higher than or equal position to mine, I will be unable to apply that role.";

                const data = await autorole.findOne({ Guild: guild.id });
                if(!data) throw "You do not have autorole set up!";

                if(data.Roles.includes(validrole.id)) throw "That role is already added to autorole!";

                data.Roles.push(validrole.id);

                return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle(`Added role to autorole`)
                        .setDescription(`Your role (<@&${validrole.id}>) has been added to autorole.\nWhenever a new member joins, they will be given this role as well as your other roles.`)
                        .setColor('Green')
                    ]
                });
            }
            break;

            case 'removerole': {
                const validrole = await guild.roles.cache.get(role.id);
                if(!validrole) throw "That role does not exist in this server.";

                const data = await autorole.findOne({ Guild: guild.id });
                if(!data) throw "You do not have autorole set up!";

                if(!data.Roles.includes(validrole.id)) throw "That role isn\'t set up in autorole.";

                if(data.Roles.length <= 1) {
                    throw "If you want to remove all of your roles, use /autorole disable.";
                } else {
                    const indexOf = data.Roles.indexOf(validrole.id);
                    if(isNaN(indexOf)) throw "That index was not found.";

                    data.Roles.splice(indexOf, 1);
                    data.save();

                    return interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                            .setTitle(`Removed role from autorole`)
                            .setDescription(`Your role (<@&${validrole.id}>) has been removed from autorole.\nWhenever a new member joins, they will not be given this role.`)
                            .setColor('Green')
                        ]
                    });
                }
            }
            break;
        }
    }
}