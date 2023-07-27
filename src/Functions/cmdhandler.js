const fs = require('fs');
const log = require('./logger');

module.exports = async function startcmdhandler(client) {
    let commandsArray = [];

    const folders = fs.readdirSync(`./src/Commands`);

    for (const folder of folders) {
        const files = fs.readdirSync(`./src/Commands/${folder}`).filter((file) => file.endsWith(".js"));

        for (const file of files) {
            const command = require(`../Commands/${folder}/${file}`);

            client.commands.set(command.data.name, command);

            commandsArray.push(command.data.toJSON());

            continue;
        }
    }

    client.application.commands.set(commandsArray);

    log('Commands Loaded.');
}