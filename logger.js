const chalk = require('chalk');

const getTimestamp = () => {
    return new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
};

const startupBanner = () => {
    const banner = `
${chalk.blue.bold('                  d8888b. d888888b d8b   db  .d88b.  ')}
${chalk.blue.bold('                  88  `8D   `88\'   888o  88 .8P  Y8. ')}
${chalk.blue.bold('                  88oobY\'    88    88V8o 88 88    88 ')}
${chalk.blue.bold('                  88`8b      88    88 V8o88 88    88 ')}
${chalk.blue.bold('                  88 `88.   .88.   88  V888 `8b  d8\' ')}
${chalk.blue.bold('                  88   YD Y888888P VP   V8P  `Y88P\'  ')}

${chalk.green.bold('     Welcome to AlyaBot - Created with <3 by G4NGGAAA')}
${chalk.cyan('--------------------------------------------------------------')}
    `;
    console.log(banner);
    info('Initializing modules...');
    success('API Baileys Loaded');
    success('File System Ready');
    success('Database Initialized');
    console.log(chalk.cyan('--------------------------------------------------------------'));

};

const log = (message, ...args) => {
    console.log(chalk.gray(`[${getTimestamp()}]`), chalk.white(message), ...args);
};

const info = (message, ...args) => {
    console.log(chalk.cyan.bold(`[i INFO]`), chalk.cyan(`[${getTimestamp()}]`), chalk.cyan(message), ...args);
};

const success = (message, ...args) => {
    console.log(chalk.green.bold(`[✓ SUCCESS]`), chalk.green(`[${getTimestamp()}]`), chalk.green(message), ...args);
};

const error = (message, ...args) => {
    console.log(chalk.red.bold(`[✗ ERROR]`), chalk.red(`[${getTimestamp()}]`), chalk.red(message), ...args);
};

const warn = (message, ...args) => {
    console.log(chalk.yellow.bold(`[⚠ WARN]`), chalk.yellow(`[${getTimestamp()}]`), chalk.yellow(message), ...args);
};

const logPrivate = (sender, message) => {
    console.log(`
${chalk.magenta('┌───[ PRIVATE MSG ]')}
${chalk.magenta('│')} ${chalk.white('Time:')}    ${chalk.green(getTimestamp())}
${chalk.magenta('│')} ${chalk.white('Sender:')}  ${chalk.cyan(sender)}
${chalk.magenta('│')} ${chalk.white('Message:')} ${chalk.blue(message)}
${chalk.magenta('└───')}`);
};

const logGroup = (sender, message, groupName) => {
    console.log(`
${chalk.yellow('┌───[ GROUP MSG ]')}
${chalk.yellow('│')} ${chalk.white('Time:')}    ${chalk.green(getTimestamp())}
${chalk.yellow('│')} ${chalk.white('Group:')}   ${chalk.magenta(groupName)}
${chalk.yellow('│')} ${chalk.white('Sender:')}  ${chalk.cyan(sender)}
${chalk.yellow('│')} ${chalk.white('Message:')} ${chalk.blue(message)}
${chalk.yellow('└───')}`);
};

module.exports = {
    startupBanner,
    log,
    info,
    success,
    error,
    warn,
    logPrivate,
    logGroup
};
