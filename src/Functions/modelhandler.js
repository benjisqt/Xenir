const { readdirSync } = require('fs');
const log = require('./logger');

async function startmodelhandler() {
    const models = readdirSync(`./src/Models`).filter((file) => file.endsWith(".js"));

    log(`${models.length} models registered.`);
}

module.exports = { startmodelhandler }