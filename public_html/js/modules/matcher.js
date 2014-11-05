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
 * Matcher which implements certain functions for searching
 */
define(['modules/parser'], function (parser) {

    var MatcherError = function (message) {
        this.message = message;
    };

    MatcherError.prototype.toString = function () {
        return this.message;
    };



    var SUITS = ['C', 'D', 'H', 'S', 'N'];

    var TOKENS = {
        'm': ['C', 'D'], 'M': ['H', 'S'],
        'X': SUITS, 'Y': SUITS, 'Z': 'SUITS'
    };

    /**
     * Returns only the subset of the allowedValues which are not named
     */
    var narrowToUnnamedValues = function (namedSuits, allowedValues) {
        var retVal = [];
        for (var i in allowedValues) {
            if (namedSuits.indexOf(allowedValues[i]) < 0) {
                retVal[retVal.length] = allowedValues[i];
            }
        }
        return retVal;
    }

    /**
     * Prepare sequence for matching bids
     */
    var composeSequenceMeta = function (source) {

        // Which suits are named in the criteria
        var namedSuits = [];
        for (var i in source) {
            for (var j in source[i]) {
                var suit = source[i][j].value.substr(-1);
                
                // If this bid is exact it means that is not a named suit
                // but more of a relay
                if(source[i][j].exact !== undefined){
                    continue;
                }
                
                if (SUITS.indexOf(suit) >= 0) {
                    namedSuits[namedSuits.length] = suit;
                }
            }
        }

        // Which suits are left unnamed?
        var unnamedSuits = [];
        for (var i in SUITS) {
            if (namedSuits.indexOf(SUITS[i]) < 0) {
                unnamedSuits[unnamedSuits.length] = SUITS[i];
            }
        }

        var tokenAssignments = {};
        for (var i in source) {
            for (var j in source[i]) {
                var token = source[i][j].value.substr(-1);
                if (TOKENS[token] !== undefined) {
                    if (tokenAssignments[token] === undefined) {
                        tokenAssignments[token] = narrowToUnnamedValues(namedSuits, TOKENS[token]);
                    }
                }
            }
        }

        return tokenAssignments;
    };
    
    /**
     * Apply transform to value
     */
    var applyTransform = function(rank, suit, transform){
        // No transform
        if(transform === undefined){
            return rank + suit;
        }
        
        var SUIT_STR = "CDHSN";
        
        var suitRank = SUIT_STR.indexOf(suit);
        if(suitRank < -1){
            throw new MatcherError("Can't match" + suit + " as a legal suit");
        }
        
        var sign = transform.charAt(0);
        var value = parseInt(transform.substr(1));
        
        var bidValue = SUIT_STR.length * rank + suitRank;
        if(sign == '+'){
            bidValue += value;
        } else if (sign == '-'){
            bidValue -= value;
        }
        
        return parseInt(bidValue / SUIT_STR.length) + SUIT_STR[bidValue % SUIT_STR.length];
    };

    /**
     * Composes key which can be later reused for matching
     */
    var composeKey = function (source, notAssigned, pos) {
        if (notAssigned === undefined) {
            notAssigned = composeSequenceMeta(source);
        }
        if (pos === undefined) {
            pos = 0;
        }
        
        if (pos === source.length) {
            return {'': true};
        }

        var retVal = {};
        for (var i in source[pos]) {
            var bid = source[pos][i].value;
            var transform = source[pos][i].transform;
            
            var rank = bid.charAt(0);
            var suit = bid.substr(-1);
            
            // This is a real suit
            if (SUITS.indexOf(suit) >= 0) {
                var next = composeKey(source, notAssigned, pos + 1);
                for (var k in next) {
                    retVal[applyTransform(rank, suit, transform) + k] = true;
                }
                // This is a token
            } else {
                var allowedValues = notAssigned[suit];
                for (var j in allowedValues) {
                    // This now becomes assigned
                    var value = allowedValues[j];
                    
                    notAssigned[suit] = [value];
                    var next = composeKey(source, notAssigned, pos + 1);
                    
                    // Add all values to return value
                    for (var k in next) {
                        retVal[applyTransform(rank,value, transform) + k] = true;
                    }
                    
                    // This becomes unassigned again
                    notAssigned[suit] = allowedValues;
                }
            }
        }
        
        return retVal;
    };
    
    /**
     * Like substr but for bidding
     */
    var biddingSubset = function(bids, start, length){
        var retVal = [];
        for(var i = start; i < start+length && i < bids.length; i++){
            retVal[retVal.length] = bids[i];
        }
        return retVal;
    };

    /**
     * Determines whether the sequence bids matches the bidding of criteria
     */
    var isMatching = function (bids, criteria) {
        
        if(bids.length > criteria.length){
            bids = biddingSubset(bids, 0, criteria.length);
        }
        
        if(criteria.length > bids.length){
            criteria = biddingSubset(criteria, 0, bids.length);
        }
        
        var leftKey = composeKey(bids);
        var rightKey = composeKey(criteria);
        
        if(leftKey.length == 0 || rightKey.length == 0){
            return true;
        }
        
        for(var i in leftKey){
            if(rightKey[i] !== undefined){
                return true;
            }
        }
        
        return false;
    };
    
    /**
     * Filter situations
     */
    var applyFilter = function(situation, filterBidding){
                
        if(filterBidding.length == 0){
            return situation.lines;
        }
        
        var lines = [];
        var onlyExtension = true;
        for(var i in situation.lines){
            var line = situation.lines[i];
            if(line.bidding.sequence.length == 1 && line.bidding.sequence[0] == 'EXT'){
                lines[lines.length] = line;
                continue;
            }
            
            if(isMatching(situation.baseBidding.bids.concat(line.bidding.bids), filterBidding)){
                onlyExtension = false;
                lines[lines.length] = line;
            }
        }
        
        if(!onlyExtension){
            return lines;
        }
        
        return [];
    };

    return {
        isMatching: isMatching,
        composeSequenceMeta: composeSequenceMeta,
        composeKey: composeKey,
        applyFilter: applyFilter,
        MatcherError: MatcherError
    };
});

