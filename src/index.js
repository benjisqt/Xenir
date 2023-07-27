const Discord = require('discord.js');
const config = require('../config.json');
const log = require('./Functions/logger');
const startcmdhandler = require('./Functions/cmdhandler');
const starteventhandler = require('./Functions/eventhandler');

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

client.commands = new Discord.Collection();

client.login(config.token).then(async () => {
    startcmdhandler(client);
    starteventhandler(client);
});