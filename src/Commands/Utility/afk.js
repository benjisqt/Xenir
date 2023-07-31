const { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, PermissionFlagsBits, Client } = require('discord.js');
const afk = require('../../Models/afk');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('afk')
    .setDescription('Go AFK or get a list of the people who are!')
    .addSubcommand((sub) =>
        sub.setName('set')
        .setDescription('Set your AFK status!')
        .addStringOption((opt) =>
            opt.setName('message')
            .setDescription('Do you want to leave a message behind!')
        )
    )
    .addSubcommand((sub) =>
        sub.setName('list')
        .setDescription('List all people in the server who are AFK!')
    ),

    /**
     * 
     * @param {ChatInputCommandInteraction} interaction
     * @param {Client} client
     */

    async execute(interaction, client) {
        const { guild, options } = interaction;

        const sub = options.getSubcommand();

        const date = new Date();
        const ms = date.getTime();

        switch(sub) {
            case 'set': {
                const message = options.getString('message') || "No message provided.";

                await afk.create({
                    Guild: guild.id,
                    User: interaction.user.id,
                    Message: message,
                    AFKSinceMS: ms,
                });

                const msg = await interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                        .setDescription(`✅ | Your AFK status has been set. Message: ${message}`)
                        .setColor('Blurple')
                    ]
                });

                setTimeout(() => {
                    msg.delete();
                }, 2000);
            }
            break;

            case 'list': {
                if(!interaction.member.permissions.has('ModerateMembers')) throw "You do not have the appropriate permissions to run this Subcommand.";

                const allafk = await afk.find({ Guild: interaction.guildId });
                if(!allafk || allafk.length <= 0) throw "There are no AFK members in this server.";

                const afkmembers = allafk.map((afks) => {
                    const discordms = Math.round(afks.AFKSinceMS / 1000);

                    return `Member: <@${afks.User}>\nMessage: ${afks.Message}\nAFK Since: <t:${discordms}:R>`
                }).join('\n\n');

                return interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                        .setTitle(`All AFK Members in ${guild.name}`)
                        .setDescription(afkmembers)
                        .setColor('Blurple')
                        .setFooter({ text: `Xenir`, iconURL: `${client.user.displayAvatarURL()}` })
                    ], ephemeral: true
                });
            }
            break;
        }
    }
}