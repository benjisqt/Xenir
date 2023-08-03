const { GuildMember, Client } = require('discord.js');
const autorole = require('../../Models/autorole');

module.exports = {
    name: 'guildMemberAdd',

    /**
     * 
     * @param {GuildMember} member
     * @param {Client} client
     */

    async execute(member, client) {
        const { guild } = member;
        if(member.user.bot) return;

        const data = await autorole.findOne({ Guild: guild.id });
        if(!data) return;

        data.Roles.forEach(async (role) => {
            const validrole = await guild.roles.cache.get(role);
            if(!validrole) return;

            if(validrole.position >= guild.members.me.roles.highest.position) return;

            member.roles.add(validrole.id);
        });
    }
}