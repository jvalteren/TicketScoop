'use strict';

const utils = require('./utils');
const extend = require('util')._extend;
const _request = require('request');
const logger = require('./logger');
const userAgent = require('random-useragent');

function request({ url, session, token }, opts={}) {
    var jar = _request.jar();

    jar.setCookie(_request.cookie(`session=${session}`), url);
    jar.setCookie(_request.cookie(`token=${token}`), url);
    jar.setCookie(_request.cookie(`cookieAccepted=cookieAccepted`), url);

    var options = extend(opts, {
        url,
        jar,
        headers: extend({
            'Referer': 'https://www.ticketswap.nl/lowlands',
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.13; rv:62.0) Gecko/20100101 Firefox/62.0',
        }, opts.headers || {}),
    });

    return new Promise(function(resolve, reject) {
        utils.logRequest(url, options);
        
        _request(options, function(err, response, body) {
            logger.debug('response %s', url, { options, err, response, body });

            if (err) {
                reject({ error: err });
            } else if(! /^2/.test('' + response.statusCode)) {
                reject({ 
                    error: body,
                    response: response 
                });
            } else {
                resolve({
                    response: response,
                    body: body,
                });
            }
        });
    });
}

module.exports.request = request;