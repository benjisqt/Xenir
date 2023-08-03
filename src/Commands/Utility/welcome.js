const { SlashCommandBuilder, ChatInputCommandInteraction, Client, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
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
            }
            break;

            case 'disable': {

            }
            break;

            case 'modify': {

            }
            break;
        }
    }
}