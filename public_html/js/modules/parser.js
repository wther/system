/* 
 * The MIT License
 *
 * Copyright 2014 Barnabas Szirmay.
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
 * The parser module is responsible for parsing raw strings
 * at transforming them to Javascript objects containing the
 * system information.
 * 
 * @returns parser
 */
define(['modules/bidParser'], function (bidParser) {

    /**
     * Basically works as String.split('-'), but only minimum
     * chunk size if 2. Also safe for empty string.
     */
    var splitBidding = function (str) {
        str = str.trim();

        if (str.length == 0) {
            return [];
        }

        var splitValue = str.split('-');
        var retVal = [];

        for (lineNumber in splitValue) {
            var value = splitValue[lineNumber];

            if (value.length > 1) {
                retVal[retVal.length] = value;
            } else {
                if (value.length > 0) {
                    retVal[retVal.length - 1] += '-' + value;
                } else {
                    throw new bidParser.ParserError("Illegal bidding chunks in: " + str);
                }
            }
        }

        return retVal;
    };

    /**
     * Parse bidding string
     * 
     * @param {type} rawBidding
     * @returns {undefined}
     */
    var parseBidding = function (rawBidding) {

        // No bidding is bidding;
        var tokens = splitBidding(rawBidding);

        var sequence = [], bids = [];
        for (lineNumber in tokens) {
            var parsedValue = bidParser.parseSingleBid(tokens[lineNumber]);

            sequence[sequence.length] = parsedValue.sequence;

            for (lineNumber in parsedValue.embeddedBids) {
                bids[bids.length] = parsedValue.embeddedBids[lineNumber];
            }
        }

        return {
            'raw': rawBidding,
            'sequence': sequence,
            'bids': bids
        };
    };

    /**
     * Parse tag string
     * 
     * @param {type} tag
     * @returns {Array}
     */
    var parseTag = function (tag) {
        return [tag];
    };

    /**
     * Parse line as JS array
     * Example: "1C@normal:3+Cl, (11)12+HCP, open 1Cl if 33 in minors, N5CM"
     * 
     * @param {type} line
     * @returns {undefined}
     */
    var parseLine = function (line) {

        var basePattern = /^([\w-+\/!\(\)\s]*)(@)?(\w*)?:(.*)*?$/;

        var result = line.match(basePattern);
        if (result === null) {
            throw new bidParser.ParserError("Line has incorrect format: '" + line + "'");
        }

        var bidding = 'UNKNOWN';
        if (result[1] == 'EXT') {
            bidding = {
                'sequence': ['EXT'],
                'bids': ['EXT'],
                'raw': 'EXT'
            };
        } else {
            bidding = parseBidding(result[1]);
        }

        // Sometimes there is a @ for tagging, if it's there
        // set the value for tag, otherwise it's proceeded 
        // by the explanation immediately
        var tag = (result[3] !== undefined) ? result[3] : 'normal';
        var explanation = result[4];

        return {
            bidding: bidding,
            tag: parseTag(tag),
            explanation: explanation !== undefined ? explanation.trim() : '',
            raw: line
        };
    };

    /**
     * Parses many lines and returns them as javascript objects
     * @param {type} content
     * @returns {undefined}
     */
    var parse = function (content) {

        var lines = content.split("\n");

        // Last line has to be empty, force this
        lines[lines.length] = '';

        // Status can be 'title' -> baseBidding -> lines
        var parseState = 'title';

        var title = '';
        var baseBidding = [];
        var biddingLines = [];

        var retVal = [];
        
        for (lineNumber in lines) {
            try {
                var line = lines[lineNumber].trim();

                // Line commented out
                if (line.length > 0 && line[0] == '#') {
                    continue;
                }

                // Empty line
                if (line.length == 0) {
                    if (parseState == 'lines' && biddingLines.length > 0) {
                        parseState = 'title';
                        retVal[retVal.length] = {
                            title: title,
                            baseBidding: baseBidding,
                            lines: biddingLines
                        };
                        title = '';
                        baseBidding = [];
                        biddingLines = [];
                    }

                    // Parsing tite
                } else if (parseState == 'title') {
                    if (title.length > 0) {
                        throw new bidParser.ParserError("Ambigous title: " + title);
                    }
                    title = line;
                    parseState = 'baseBidding';

                    // Parsing base bidding
                } else if (parseState == 'baseBidding') {
                    if (baseBidding.length != 0) {
                        throw new bidParser.ParserError("Ambigous base bidding: " + line);
                    }
                    
                    if (line.substr(-1) == '*' || line.substr(-1) == '?') {
                        if (line.charAt(line.length-2) == '-') {
                            line = line.substr(0, line.length - 2);
                        } else {
                            line = line.substr(0, line.length - 1);
                        }
                    }
                    baseBidding = parseBidding(line);
                    parseState = 'lines';

                    // All the rest are lines for this situation until a new line is added
                } else {
                    biddingLines[biddingLines.length] = parseLine(line);
                }
            } catch (e) {
                e.line = lineNumber;
                throw e;
            }
        }

        return retVal;
    };

    return {
        parseBidding: parseBidding,
        parseLine: parseLine,
        parse: parse,
        ParserError: bidParser.ParserError
    };
});
