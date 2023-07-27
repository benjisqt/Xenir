const chalk = require('chalk');

module.exports = async function log(description, error) {
    if(error === true) {
        return console.log(`${chalk.bold(chalk.red(`Xenir`))} ${chalk.bold(`>>`)} ${chalk.italic(description)}`);
    } else if (error === false || !error) {
        return console.log(`${chalk.bold(chalk.blue(`Xenir`))} ${chalk.bold(`>>`)} ${chalk.italic(description)}`);
    }
}