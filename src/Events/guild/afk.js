const { Message, Client, EmbedBuilder } = require('discord.js');
const afk = require('../../Models/afk');

module.exports = {
    name: 'messageCreate',

    /**
     * 
     * @param {Message} message
     * @param {Client} client
     */
    
    async execute(message, client) {
        if(message.author.bot) return;

        const userdata = await afk.findOne({ Guild: message.guild.id, User: message.author.id });
        if(userdata) {
            await afk.deleteOne({ Guild: message.guild.id, User: message.author.id }, { new: true });

            const msg = await message.reply({
                embeds: [
                    new EmbedBuilder()
                    .setDescription(`✅ | Your AFK status has been removed, welcome back!`)
                    .setColor('Green')
                ]
            });

            setTimeout(() => {
                msg.delete();
            }, 2000);
        } else {
            const mention = message.mentions.members.first();
            if(!mention) return;

            const mentionedmodel = await afk.findOne({ Guild: message.guild.id, User: mention.id });
            if(!mentionedmodel) return;

            const member = await message.guild.members.cache.get(mention.id);

            const msg = await message.reply({
                embeds: [
                    new EmbedBuilder()
                    .setDescription(`🚫 | ${mention} is currently AFK.\nMessage: ${mentionedmodel.Message}`)
                    .setColor('Red')
                ]
            });

            setTimeout(() => {
                msg.delete();
            }, 2000);
        }
    }
}