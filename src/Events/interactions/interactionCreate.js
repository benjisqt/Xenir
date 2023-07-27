const { ChatInputCommandInteraction, Client, EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'interactionCreate',

    /**
     * 
     * @param {ChatInputCommandInteraction} interaction
     * @param {Client} client
     */

    async execute(interaction, client) {
        const command = client.commands.get(interaction.commandName);
        if(!command) return interaction.reply({ content: `🚫 That command is either outdated or has been removed.` });

        try {
            await command.execute(interaction, client);
        } catch (err) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                    .setTitle(`Xenir has encountered an error.`)
                    .setDescription(`An error has been thrown.\n**${err}**`)
                    .setColor('Red')
                    .setFooter({ text: `Xenir Error.`, iconURL: client.user.displayAvatarURL() })
                ]
            })
        }
    }
}