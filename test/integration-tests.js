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

require(['modules/parser', 'modules/renderer'], function (parser, renderer) {
    
    QUnit.module( "Integration tests" );
    
    QUnit.test("Test parsing 2nd level collapsed cells", function (assert) {
        
        var content = 
               "#Entry for situation: 7\n" +
               "Two way checkback\n" +
               "*\n" + 
               "1m-1H-1N-2S@normal:44 INV, 2NT: pick a minor\n" +
               "1m-1M-1N-2D over 2C!-2M@important:5(6)M, INV, NF, 2NT: pick a minor\n" + 
               "1m-1M-1N-2D!-2oM@normal:4oM, this 1m-1Sp-1NT-2D-2H-2Sp-3H shows singleton Sp\n" +
               "1H-1S-1N-2D-3H@normal:26(32)\n";
                
        var situations = parser.parse(content);
        var cells = renderer.prepareCells(situations[0].lines);
        
        assert.equal(situations[0].title, "Two way checkback");
        assert.equal(cells[0][0].height, 3, "Height of 1m OK");
        assert.equal(cells[0][2].height, 1, "Height of 1NT in first row OK");
        assert.equal(cells[1][2].height, 2, "Height of 1NT in second row OK");
    });
});


