const Discord = require('discord.js');
const config = require('../config.json');
const mongoose = require('mongoose');
const log = require('./Functions/logger');
const startcmdhandler = require('./Functions/cmdhandler');
const starteventhandler = require('./Functions/eventhandler');
const { startmodelhandler } = require('./Functions/modelhandler');

// CONNECTION METHODS: MongoDB (more coming soon!)
const connectionmode = 'mongo';

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
    startmodelhandler();
    if(connectionmode === 'mongo') {
        try {
            const connection = await mongoose.connect(config.database);
            if(connection) {
                log(`XenirDB connected successfully.`);
            } else {
                return log(`Mongoose wasn't able to connect for an unknown reason.`, true);
            }
        } catch (err) {
            return log(`Mongoose wasn't able to connect: ${err}`, true);
        }
    } else {
        return log(`That is not a valid database connection method. Try: 'mongo'`, true);
    }
});