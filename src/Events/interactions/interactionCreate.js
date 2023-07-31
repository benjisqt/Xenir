const { ChatInputCommandInteraction, Client, EmbedBuilder } = require('discord.js');
const afk = require('../../Models/afk');

module.exports = {
    name: 'interactionCreate',

    /**
     * 
     * @param {ChatInputCommandInteraction} interaction
     * @param {Client} client
     */

    async execute(interaction, client) {
        if(interaction.user.bot) return;

        const command = client.commands.get(interaction.commandName);
        if(!command) return interaction.reply({ content: `🚫 That command is either outdated or has been removed.` });

        const userdata = await afk.findOne({ Guild: interaction.guildId, User: interaction.user.id });
        if(userdata) {
            await afk.deleteOne({ Guild: interaction.guildId, User: interaction.user.id }, { new: true });

            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                    .setTitle(`AFK status removed`)
                    .setDescription(`Your AFK status has been removed because you ran a command.`)
                    .setColor('Green')
                ], ephemeral: true
            });
        }

        try {
            await command.execute(interaction, client);
        } catch (err) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                    .setTitle(`Xenir has encountered an error.`)
                    .setDescription(`An error has been thrown:\n\`\`\`${err}\`\`\``)
                    .setColor('Red')
                    .setFooter({ text: `Xenir Error.`, iconURL: client.user.displayAvatarURL() })
                ], ephemeral: true
            });
        }
    }
}