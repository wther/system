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
 * Module dealing with revision
 */
define([], function () {
    
    var parseRevisions = function(revisions){
        
        if(revisions.length < 1){
            return {};
        }
        
        var last = revisions[revisions.length-1];
        var lines = last.content.split("\n");
        
        // Set values for lines
        var result = {};
        for(var i in lines){
            result[lines[i]] = last.date;
        }    
        
        // Iterate backwards
        for(var i = revisions.length-2; i >= 0; i--){
            var current = revisions[i];
            
            for(var j in result){
                if(result[j] == last.date){
                    if(current.content.indexOf(j) >= 0){
                        result[j] = current.date;
                    }
                }                
            }
            last = current;
        }
        
        return result;
    };
    
    /**
     * Calculates a unique has for each date
     */
    var revisionHash = function (revisions){
        
        var takenClasses = {};
        var size = (revisions.length + 1);
        
        // Select first the range of the dates of the revisions,
        // the oldest should be the greenest (most known) and the
        // newest should be the most red (most unknown)
        
        var dateMin = new Date();
        var dateMax = new Date();
        dateMax.setFullYear(dateMin.getFullYear() - 2);
        
        for(var i in revisions){
            var revision = revisions[i];
            var date = new Date(revision.date);
            
            if(date < dateMin){
                dateMin = date;
            }
            
            if(date > dateMax){
                dateMax = date;
            }
        }
        
        var range = (dateMax.getTime() - dateMin.getTime());
        
        if(range <= 0){
            range = 1;
        }
        
        for (var i in revisions) {
            var revision = revisions[i];
            var date = new Date(revision.date);
            
            // Where is this date between the dateMin and dateMax, if close to the
            // dateMin make it around size-1, if its around dateMax make it 0
            var hash = Math.floor(size - size * (date.getTime() - dateMin.getTime()) / range);
            
            for(var j = 0; j < 200; j++){
                if(takenClasses[hash] !== undefined){
                    hash = (hash + 1) % size;
                } else {
                    break;
                }
            }
            takenClasses[hash] = revision.date;
        }
        
        var retVal = {};
        for(i in takenClasses){
            retVal[takenClasses[i]] = i;
        }
        
        return retVal;
    };
    
    return {
        parseRevisions: parseRevisions,
        revisionHash: revisionHash
    };    
});
