/* 
 * The MIT License
 *
 * Copyright 2014 Szirmay Barnabas <bszirmay@gmail.com>.
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

require(['modules/revisions'], function (revisions) {
    
    QUnit.module( "Revisions test" );
        
    // Test parsing single lines
     QUnit.test("Test parsing revisions", function (assert) {
        var data = [
            {
            date: "2014-09-24 17:13:42",
            content: 'A\nB\n\C'
            },
            {
            date: "2014-09-25 17:13:42",
            content: 'A\nB'
            },
            {
            date: "2014-09-26 17:13:42",
            content: 'B\n\D'
            }
        ];
        
        // Act
        result = revisions.parseRevisions(data);
        
        // Assert
        assert.deepEqual(result, {
            'B': "2014-09-24 17:13:42", 
            'D': "2014-09-26 17:13:42"
        });         
     });
    

});

