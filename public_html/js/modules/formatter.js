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
 * The formatter module is responsible converting a JSON
 * object to text.
 * 
 * @returns parser
 */
define([], function () {
    
    /**
     * Converts situation object to text
     * 
     * @param {type} situation
     * @returns {String}
     */
    var formatSituation = function(situation){
        
        var retVal = '';
        
        // The title
        retVal += situation.title + "\n";
        
        // The base bidding for the situations
        var baseBidding = situation.baseBidding.sequence.join('-');
        baseBidding += (baseBidding != '' ? '-' : '') + '?';
        retVal += baseBidding + "\n";
        
        // An empty line
        retVal += "\n";
        
        // Each line of bidding
        for(var j in situation.lines){
            var line = situation.lines[j];
            
            retVal += line.bidding.sequence.join('-');
            retVal += '@';
            retVal += line.tag.join(',');
            retVal += ':';
            retVal += line.explanation;
            retVal += "\n";
        }
        
        return retVal + "\n";
    };
    
    return {
        formatSituation: formatSituation
    };    
});
