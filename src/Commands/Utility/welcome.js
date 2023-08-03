const { SlashCommandBuilder, ChatInputCommandInteraction, Client, EmbedBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType } = require('discord.js');
const welcome = require('../../Models/welcome');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('welcome')
    .setDescription('Setup/modify/disable the welcome system within your server!')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand((sub) =>
        sub.setName('setup')
        .setDescription('Setup the welcome system within your server!')
        .addChannelOption((opt) =>
            opt.setName('channel')
            .setDescription('The channel you want welcome messages to be sent to!')
            .setRequired(true)
        )
        .addStringOption((opt) =>
            opt.setName('message')
            .setDescription(`Do you want to add a custom message? If so, add it here!`)
            .setMaxLength(2048)
        )
    )
    .addSubcommand((sub) =>
        sub.setName('disable')
        .setDescription('Disable the welcome system.')
    )
    .addSubcommand((sub) =>
        sub.setName('modify')
        .setDescription('Modify either the welcome channel or message!')
        .addStringOption((opt) =>
            opt.setName('option')
            .setDescription('What do you want to modify?')
            .setRequired(true)
            .addChoices(
                { name: `Change welcome message`, value: `message` },
                { name: `Change welcome channel`, value: `channel` }
            )
        )
    ),

    /**
     * 
     * @param {ChatInputCommandInteraction} interaction
     * @param {Client} client
     */

    async execute(interaction, client) {
        const { options, guild } = interaction;
        const option = options.getString('option') || "";
        const channel = options.getChannel('channel') || null;
        const message = options.getString('message') || "";

        const sub = options.getSubcommand();

        switch(sub) {
            case 'setup': {
                const validchannel = guild.channels.cache.get(channel.id);
                if(!validchannel) throw "That channel isn't in this server.";

                const data = await welcome.findOne({ Guild: guild.id });
                if(data) throw "The welcome system is already set up.";

                if(validchannel.type === ChannelType.GuildText) {
                    if(validchannel.type === ChannelType.GuildAnnouncement) {
                        throw "Channel is not of type `GuildText` or `GuildAnnouncement`."
                    }
                }

                await welcome.create({
                    Guild: guild.id,
                    Channel: validchannel.id,
                    Message: message,
                });

                return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                        .setDescription(`✅ | The welcome system has been set up.\nAll welcome messages with your custom message will be sent to <#${validchannel.id}>.\nDon't like this? Change it using /welcome modify :)`)
                        .setColor('Green')
                    ]
                });
            }
            break;

            case 'disable': {
                const data = await welcome.findOne({ Guild: guild.id });
                if(!data) throw "The welcome system is already disabled.";

                const button1 = new ButtonBuilder()
                .setCustomId('confirm')
                .setLabel('Confirm ✅')
                .setStyle(ButtonStyle.Primary)

                const button2 = new ButtonBuilder()
                .setCustomId('deny')
                .setLabel('Deny 🚫')
                .setStyle(ButtonStyle.Primary)

                const row = new ActionRowBuilder()
                .setComponents(button1, button2)

                const msg = await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle(`⚠️ Approval Required.`)
                        .setDescription(`Are you sure you want to disable the welcome system? Your welcome channel and message will be deleted.`)
                        .setColor('Orange')
                    ], components: [row]
                });

                const collector = await msg.createMessageComponentCollector({ filter: i => i.user.id === interaction.user.id, time: 6000 });

                collector.on('collect', async(results) => {
                    if(results.customId === 'confirm') {
                        await welcome.deleteMany({ Guild: guild.id });

                        if(msg) {
                            return msg.edit({
                                embeds: [
                                    new EmbedBuilder()
                                    .setDescription(`✅ | The welcome system has been disabled.\nAll welcome channel and message data has been deleted.`)
                                    .setColor('Green')
                                ]
                            });
                        } else {
                            return interaction.channel.send({
                                embeds: [
                                    new EmbedBuilder()
                                    .setDescription(`✅ | The welcome system has been disabled.\nAll welcome channel and message data has been deleted.`)
                                    .setColor('Green')
                                ]
                            });
                        }
                    } else if (results.customId === 'deny') {
                        if(msg) {
                            return msg.edit({
                                embeds: [
                                    new EmbedBuilder()
                                    .setTitle(`⚠️ Approval Denied.`)
                                    .setDescription(`You have denied the request to clear your welcome system data. All of your data is intact.`)
                                    .setColor('Red')
                                ]
                            });
                        } else {
                            return interaction.channel.send({
                                embeds: [
                                    new EmbedBuilder()
                                    .setTitle(`⚠️ Approval Denied.`)
                                    .setDescription(`You have denied the request to clear your welcome system data. All of your data is intact.`)
                                    .setColor('Red')
                                ]
                            });
                        }
                    } else {
                        if(msg) {
                            return msg.edit({
                                embeds: [
                                    new EmbedBuilder()
                                    .setTitle(`⚠️ Unknown Interaction.`)
                                    .setDescription(`You have sent data that I do not recognise.`)
                                    .setColor('Red')
                                ]
                            });
                        } else {
                            return interaction.channel.send({
                                embeds: [
                                    new EmbedBuilder()
                                    .setTitle(`⚠️ Approval Denied.`)
                                    .setDescription(`You have sent data that I do not recognise.`)
                                    .setColor('Red')
                                ]
                            });
                        }
                    }
                });
            }
            break;

            case 'modify': {

            }
            break;
        }
    }
}