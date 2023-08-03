const { GuildMember, Client, ChannelType } = require('discord.js');
const welcome = require('../../Models/welcome');
const canva = require('canvacord');

module.exports = {
    name: 'guildMemberAdd',

    /**
     * 
     * @param {GuildMember} member
     * @param {Client} client
     */

    async execute(member, client) {
        const data = await welcome.findOne({ Guild: member.guild.id });
        if(!data) return;

        const validchannel = await member.guild.channels.cache.get(data.Channel);
        if(!validchannel) return;
        if(!validchannel.permissionsFor(client.user).has('SendMessages')) return;
        if(validchannel.type !== ChannelType.GuildText) {
            if(validchannel.type !== ChannelType.GuildAnnouncement) {
                return;
            }
        }

        const attachment = await new canva.Welcomer();

        attachment.setAvatar(member.displayAvatarURL({ size: 4096 }))
        .setDiscriminator(member.user.discriminator)
        .setGuildName(member.guild.name)
        .setMemberCount(member.guild.memberCount)
        .setText(data.Message)
        .setUsername(member.user.username)

        const welcomecard = await attachment.build();

        await validchannel.send({
            files: [welcomecard.buffer]
        });
    }
}