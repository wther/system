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

require.config({
    baseUrl: "../public_html/js"
 });    

require(['modules/parser', 'modules/formatter'], function (parser, formatter) {
    
    QUnit.module( "Formatter tests" );
    
    QUnit.test("Test formatting Two way checkback", function (assert) {
        
        var content = 
               "Two way checkback\n" +
               "?\n\n" + 
               "1m-1H-1NT-2S@normal:44 INV, 2NT: pick a minor\n" +
               "1m-1M-1NT-2D over 2C-2M@important:5(6)M, INV, NF, 2NT: pick a minor\n" + 
               "1m-1M-1NT-2D!-2oM@normal:4oM, this 1m-1Sp-1NT-2D-2H-2Sp-3H shows singleton Sp\n" +
               "1H-1S-1NT-2D-3H@normal:26(32)\n";
                
        var situation = parser.parse(content)[0];
        
        // Act
        var result = formatter.formatSituation(situation);
        
        // Assert
        assert.deepEqual(result, content);
    });
    
        
    QUnit.test("Test formatting 1M competition", function (assert) {
        
        var content = 
            "1M competition\n" + 
            "?\n\n" + 
            "1M-(Dbl)-Pass@normal:May be STR BAL, thus Dbl afterwards is BAL INV\n" + 
            "1M-(Dbl)-Rdbl@important:GI+, penalty intensions or 4+M and GF (will bid CB afterwards)\n" + 
            "1M-(Dbl)-3S/4m/4H@normal:SPL\n" + 
            "EXT@important:Over 1M-(Dbl) from passed hand system is on\n" + 
            "EXT@normal:1M-(1NT):Cappelletti\n";
    
        var situation = parser.parse(content)[0];
        
        // Act
        var result = formatter.formatSituation(situation);
        
        // Assert
        assert.deepEqual(result, content);
    });
    
            
    QUnit.test("Test formatting 1M competition with 1M-? as base bidding", function (assert) {
        
        var content = 
            "1M competition\n" + 
            "1M-?\n\n" + 
            "(Dbl)-Pass@normal:May be STR BAL, thus Dbl afterwards is BAL INV\n" + 
            "(Dbl)-Rdbl@important:GI+, penalty intensions or 4+M and GF (will bid CB afterwards)\n" + 
            "(Dbl)-3S/4m/4H@normal:SPL\n" + 
            "EXT@important:Over 1M-(Dbl) from passed hand system is on\n" + 
            "EXT@normal:1M-(1NT):Cappelletti\n";
    
        var situation = parser.parse(content)[0];
        
        // Act
        var result = formatter.formatSituation(situation);
        
        // Assert
        assert.deepEqual(result, content);
    });
});


