const { Client, ActivityType } = require('discord.js');
const log = require('../../Functions/logger');

module.exports = {
    name: 'ready',

    /**
     * 
     * @param {Client} client
     */

    async execute(client) {
        client.user.setActivity({
            name: `https://www.github.com/benjisqt/Xenir`,
            type: ActivityType.Watching,
        });

        log(`${client.user.tag} is ready!`);
    }
}