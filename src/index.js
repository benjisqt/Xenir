const Discord = require('discord.js');
const config = require('../config.json');
const log = require('./Functions/logger');

const client = new Discord.Client({
    intents: [
        Discord.IntentsBitField.Flags.Guilds,
        Discord.IntentsBitField.Flags.GuildMessages,
        Discord.IntentsBitField.Flags.GuildMessageReactions,
        Discord.IntentsBitField.Flags.GuildModeration,
        Discord.IntentsBitField.Flags.GuildMembers,
        Discord.IntentsBitField.Flags.GuildVoiceStates,
        Discord.IntentsBitField.Flags.MessageContent,
    ]
});

client.on('ready', async(client) => {
    log(`${client.user.tag} is ready!`);
});

client.login(config.token);