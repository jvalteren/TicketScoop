#!/usr/bin/env node

'use strict';
const main = require('../lib/main');
const isSignedIn = require('../lib/test-session').isSignedIn;
const logger = require('../lib/logger');

const chalk = require('chalk');
const argv = require('yargs')
    .command('start')
    .option('session', {
        alias: 's',
        required: true,
        describe: 'Session ID retrieved from your ticketswap.nl cookie',
    })
    .option('token', {
        alias: 't',
        required: true,
        describe: 'Token retrieved from your ticketswap.nl cookie',
    })
    .option('amount', {
        alias: 'n',
        default: 1,
        describe: 'The amount of tickets to reserve',
    })
    .option('max_price', {
        alias: 'p',
        default: 0,
        describe: 'The maximum price you want to pay',
    })
    .demandOption('s', 'We need your session id to reserve tickets')
    .demandOption('t', 'To ensure not getting kicked out, we need your token')
    .demandCommand(2)
    .help()
    .argv;

const options = { 
    url: argv._[1],
    baseUrl: 'https://www.ticketswap.nl',
    sessionID: argv['s'],
    token: argv['t'],
    amount: argv['n'],
    max_price: argv['p']
};

function mask(input) {
    let x = input.length - 6;
    return 'x'.repeat(x) + input.slice(x);
}

logger.info(`${chalk.green('TicketScoop')} now running with configuration:`);
logger.info([
    ` ${chalk.magenta('url')}       = ${options.url}`,
    ` ${chalk.magenta('sessionID')} = ${mask(options.sessionID)}`,
    ` ${chalk.magenta('token')}     = ${options.token}`,
    ` ${chalk.magenta('amount')}    = ${options.amount}`,
    ` ${chalk.magenta('max_price')} = ${options.max_price}`,
    '',
].join('\n'))

isSignedIn(options)
    .then(() => main.run(options))
    .catch(error => {
        console.error([
            '',
            chalk.red('Execution of TicketScoop failed.'),
            'Please ask for help at https://github.com/matthisk/TicketScoop',
            '',
        ].join('\n'), error.stack);
    });
