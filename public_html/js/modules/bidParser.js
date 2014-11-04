/* 
 * The MIT License
 *
 * Copyright 2014 Barnabas.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

/**
 * This module is responsible for parsing a single bidding
 * segment, like 1C-1D-1NT
 * 
 * @returns
 */
define([], function () {
    var ParserError = function (message) {
        this.message = message;
    };

    ParserError.prototype.toString = function () {
        return this.message;
    };

    /**
     * Which tokens are considered valid bids even though they
     * are not a combiniation of a level and a suit
     */
    var STANDALONE_TOKENS = ['Dbl', 'Rdbl', 'Pass', 'Any'];

    /**
     * Why suits are allowed after an [1-7] value
     */
    var ALLOWED_SUITS = {
        'C': 'C', 'Cl': 'C', '!C': 'C',
        'D': 'D', '!D': 'D',
        'H': 'H', '!H': 'H',
        'S': 'S', 'Sp': 'S', '!S': 'S',
        'N': 'N', 'NT': 'N', 'SA': 'N',
        'X': 'X', 'x': 'X',
        'Y': 'Y', 'y': 'Y',
        'Z': 'Z', 'z': 'Z',
        'm': 'm', 'om': 'om',
        'M': 'M', 'oM': 'oM', 'OM': 'oM'
    };


    /**
     * Parse single bidding item, e.g. 2D/2NT
     * 
     * @param {type} singleBid
     */
    var parseSingleBid = function (singleBid) {

        // Maybe this bid has decoration, like '(Dbl)'
        var decorationMatch = singleBid.match(/^\(([\w\!\/]*)\)$/);
        if (decorationMatch !== null) {

            var decorationValue = parseSingleBid(decorationMatch[1]);

            // Reapply decoration
            return {
                sequence: '(' + decorationValue.sequence + ')',
                embeddedBids: decorationValue.embeddedBids
            };
        }

        // Maybe this bid has a relay structure, e.g.: 2D over 2C
        var relayMatch = singleBid.match(/^([1-7][\w]*[\+\-]?[0-3]?\!?)[\s*]?over[\s*]([1-7][\w]*[\+\-]?[0-3]?\!?)$/i)
        if (relayMatch !== null) {
            var relayBid = parseSingleBid(relayMatch[2]);
            var stepBid = parseSingleBid(relayMatch[1]);

            if (relayBid.embeddedBids.length != 1 && stepBid.embeddedBids.length != 1) {
                throw new ParserError("Failed to parse relay bid: " + singleBid);
            }

            return {
                sequence: stepBid.sequence + ' over ' + relayBid.sequence,
                embeddedBids: [relayBid.embeddedBids[0], stepBid.embeddedBids[0]]
            };
        }

        // Maybe this bid has a emphasised relay structure, e.g. 2C-Over 2D
        var emphasisMatch = singleBid.match(/^over[\s*]([1-7][\w]*[\+\-]?[0-3]?\!?)$/i);
        if (emphasisMatch !== null) {
            var stepBid = parseSingleBid(emphasisMatch[1]);

            return {
                sequence: 'Over ' + stepBid.sequence,
                embeddedBids: [stepBid.embeddedBids[0]]
            };
        }

        // Maybe this is a multiple bid instance
        if (singleBid.indexOf('/') >= 0) {
            var separateBids = singleBid.split('/');

            var sequence = '';
            var possibilities = [];

            for (i in separateBids) {
                var bidValue = parseSingleBid(separateBids[i]);
                sequence += (sequence != '' ? '/' : '') + bidValue.sequence;

                if (bidValue.embeddedBids.length == 1) {
                    for(j in bidValue.embeddedBids[0]){
                        possibilities[possibilities.length] = bidValue.embeddedBids[0][j];
                    }
                } else {
                    throw new ParserError("Illegal embedded bids: " + singleBid);
                }
            }

            return {
                sequence: sequence,
                embeddedBids: [possibilities]
            };
        }

        // Is it a standalone token?
        if (STANDALONE_TOKENS.indexOf(singleBid) >= 0) {

            return {
                sequence: singleBid,
                embeddedBids: [[{
                        'value': singleBid
                    }]]
            };

            // Otherwise this is something like 3S
        } else {
            var parts = singleBid.match(/^([1-7])([\w]*)([\+\-][0-3])?/);
            if (parts === null) {
                throw new ParserError("Illegal bid: '" + singleBid + "'");
            }

            // If suit part is found
            if (ALLOWED_SUITS[parts[2]] !== undefined) {

                var retVal = {
                    sequence: parts[1] + ALLOWED_SUITS[parts[2]],
                };

                var bid = {
                    'value': parts[1] + ALLOWED_SUITS[parts[2]]
                };

                // If has additional values like +1
                if (parts[3] !== undefined) {
                    var transfromNotAllowedFor = "SHDCN";
                    
                    if(transfromNotAllowedFor.indexOf(ALLOWED_SUITS[parts[2]]) >= 0){
                        throw new ParserError("Transform not allowed for " + parts[2] + " or any of " + transfromNotAllowedFor);
                    }
                    
                    retVal.sequence += parts[3];
                    bid.transform = parts[3];
                }

                // If has ! at the end
                if (singleBid.substr(-1) == '!') {
                    retVal.sequence += '!';
                    bid.exact = true;
                }

                retVal.embeddedBids = [[bid]];
                return retVal;
            } else {
                throw new ParserError("Illegal bid: '" + singleBid + "', not a valid suit: '" + parts[2] + "'");
            }
        }
    };

    return {
        ParserError: ParserError,
        parseSingleBid: parseSingleBid
    };
});
