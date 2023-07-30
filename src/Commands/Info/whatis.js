const { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('whatis')
    .setDescription('Get server info!'),

    /**
     * 
     * @param {ChatInputCommandInteraction} interaction
     */

    async execute(interaction) {
        const guild = interaction.guild;

        await guild.fetchOwner();
        await guild.members.fetch();

        const button1 = new ButtonBuilder()
        .setCustomId('seeroles')
        .setLabel('View Roles')
        .setStyle(ButtonStyle.Primary)
        
        const row = new ActionRowBuilder()
        .addComponents(button1)

        const online = guild.members.cache.filter(m => m.presence?.status === 'online').size;
        const offline = guild.members.cache.filter(m => m.presence?.status === 'offline').size;
        const idle = guild.members.cache.filter(m => m.presence?.status === 'idle').size;
        const dnd = guild.members.cache.filter(m => m.presence?.status === 'dnd').size;

        return interaction.reply({
            embeds: [
                new EmbedBuilder()
                .setAuthor({ name: `${guild.name}`, iconURL: `${guild.iconURL()}` })
                .setTitle(`Server Information`)
                .setDescription(`This guild is owned by <@${guild.ownerId}>`)
                .addFields(
                    { name: `Created`, value: `<t:${Math.round(guild.createdTimestamp / 1000)}:D> (<t:${Math.round(guild.createdTimestamp / 1000)}:R>)` },
                    { name: `Members (${guild.memberCount})`, value: `Humans: ${guild.members.cache.filter(m => !m.user.bot).size}\nBots: ${guild.members.cache.filter((m) => m.user.bot).size}`, inline: true },
                    { name: `Member Activities`, value: `:green_circle: ${online}\n:black_circle: ${offline}\n:yellow_circle: ${idle}\n:red_circle: ${dnd}`, inline: true }
                )
                .setFooter({ text: `ID: ${guild.id}` })
            ]
        })
    }
}