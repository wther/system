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
    baseUrl: "../public_html/js",
    paths: {
        jquery: "lib/jquery-2.1.1.min"
    }
});

require(['modules/renderer'], function (renderer) {

    QUnit.module("Renderer");
    
    
    var simpleInput =
    [{
            "bidding": {
                "sequence": ["1C", "1D"]
            },
            "tag": ["normal"],
            "explanation": "3+Cl, (11)12+HCP, open 1Cl if 33 in minors, N5CM"
        },
        {
            "bidding": {
                "sequence": ["1C", "1H", "1S!"]
            },
            "tag": ["normal"],
            "explanation": "3+Cl, (11)13+HCP, open 1Cl if 33 in minors, N5CM"
        },
        {
            "bidding": {
                "sequence": ["1C", "1H", "1N"]
            },
            "tag": ["normal"],
            "explanation": "3+Cl, (11)14+HCP, open 1Cl if 33 in minors, N5CM"
        }];
    
    QUnit.test("Test renderer prepares cells", function (assert) {

        var cells = renderer.prepareCells(simpleInput);

        assert.equal(cells[0][0].value, '1C', "Cell 0/0 added");
        assert.equal(cells[1][0].value, '1C', "Cell 1/0 added");
        assert.equal(cells[1][1].value, '1H', "Cell 1/1 added");
        assert.equal(cells[1][2].value, '1S!', "Cell 1/2 added");

        assert.equal(cells[0][0].height, 3, "Height for 1C calculated");
        assert.equal(cells[0][1].height, 1, "Height for 1C-1D calculated");
        assert.equal(cells[1][1].height, 2, "Height for 1C-1H calculated");
        
        assert.equal(cells['width'], 4, 'Width calculated');
    });
    
    QUnit.test("Test renderer renders cells with JQuery", function (assert) {
       
        var table = renderer.renderCells(renderer.prepareCells(simpleInput));
        
        assert.equal($(table).find('tbody tr:first td').eq(2).attr('colspan'), 2, "Rowspan for first explanation calculated");
        assert.ok($(table).find('tbody tr:first td').eq(0).hasClass('cell-bid'), "Class for first cell added");
        assert.ok($(table).find('tbody tr:first td').eq(2).hasClass('cell-explain') , "Class for explanation cell added");
        
        assert.equal($(table).find('tbody tr:last td').eq(2).attr('colspan'), undefined, "Rowspan for last explanation calculated");
        assert.ok($(table).find('tbody tr:first td').eq(2).hasClass('normal'), "Rowspan for first explanation calculated");
    });
    
    QUnit.test("Test renderer renders extensisons with JQuery", function (assert) {
        
        var content = 'ABC';
        
        var input = [
            {
                'bidding': {
                    'sequence': ['EXT']
                },
                'tag': ["normal"],
                'explanation': content
            }
        ];
       
        var div = renderer.renderExtensions(input);
        
        assert.equal($(div).find('.extension-normal').html(), content);
    });
    
    QUnit.test("Test rendering revision tree", function (assert) {
        var json = [{"author":"Anne","date":"2014-09-26"},{"author":"Bonnie","date":"2014-09-24"}];
    });
    
});



