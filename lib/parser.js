'use strict';

const chalk = require('chalk');
const cheerio = require('cheerio');
const logger = require('./logger');

class Parser {
    constructor(options, body) {
        this.options = options;
        this['$'] = cheerio.load(body);
        this.pointer = 0;
        
        this._tickesAvailable = null;
    }

    get isLocked() {
        return false;
        // return this.$('.g-recaptcha').index() >= 0
        //     && this.$('.g-recaptcha').attr('style') !== 'display: none';
    }

    get tickets() {
        return this.$('.listings-item:not(.listings-item--not-for-sale)');
    }

    get soldTickets() {
        return this.$('.listings-item.listings-item--not-for-sale');
    }

    get ticketsAvailable() {
        if (! this._tickesAvailable) {
            return this._tickesAvailable = this.getAvailableTickets();
        }

        return this._tickesAvailable;
    }

    get soldInfo() {
        return this.getSoldInfo();
    }

    popTicket() {
        if (this.pointer < this.ticketsAvailable.length) {
            return this.ticketsAvailable[this.pointer++];
        }
    }

    getSoldInfo() {
        let $ = this.$;
        var soldPrices = [];

        this.soldTickets.each(function() {
            var price = $(this).find('meta[itemprop="price"]').attr('content');
            price = parseInt(price, 10)

            soldPrices.push(price);
        });

        var soldTotal = soldPrices.reduce((a, b) => a + b, 0);
        var soldAverage = soldTotal / (soldPrices.length || 1);

        return {
            soldTotal,
            soldAverage,
        };
    }

    getAvailableTickets() {
        let $ = this.$;
        let self = this;
        let result = [];

        this.tickets.each(function(i, elem) {
            var price = $(this).find('meta[itemprop="price"]').attr('content')
            var link = $(this).find('.listings-item--title a').attr('href');
            price = parseFloat(price);

            if (! link) {
                logger.error([
                    '',
                    chalk.red('Expected to find link for listing'),
                    '',
                ].join('\n'));
            } else {
                link = self.options.baseUrl + link;

                result.push({ link, price });
            }
        });

        result = result.sort((t1, t2) => t1.price - t2.price);

        if (result.length > 0) {
            const totalAmount = result.length;
            const averagePrice = (result.reduce((mem, x) => mem + x.price, 0) / result.length).toFixed(2);
            const lowestPrice = (result[0].price).toFixed(2);
            if (self.options.max_price > 0) {
                result = result.filter((t) => t.price <= self.options.max_price);
            }
            logger.info([
                '',
                chalk.blue('Found Tickets For Event'),
                ` ${chalk.magenta('total')}                : ${totalAmount}`,
                ` ${chalk.magenta('average/lowest price')} : ${averagePrice}/${lowestPrice}`,
                ` ${chalk.magenta('below max price')}      : ${result.length}`,
                '',
            ].join('\n'));
        }

        return result;
    }
}

module.exports = Parser;
