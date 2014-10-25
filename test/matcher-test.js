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

require(['modules/matcher', 'modules/parser'], function (matcher, parser) {
    QUnit.module("Matcher");

    QUnit.test("Test matcher matches 1C-1D to 1C", function (assert) {

        var baseSequence = parser.parseBidding("1C");
        var criteria = parser.parseBidding("1C-1D");

        assert.equal(matcher.isMatching(baseSequence.bids, criteria.bids), true);
    });
    
    QUnit.test("Test matcher matches 1C to 1C/1D-1M", function (assert) {

        var baseSequence = parser.parseBidding("1C/1D-1M");
        var criteria = parser.parseBidding("1C");
        
        assert.equal(matcher.isMatching(baseSequence.bids, criteria.bids), true);
    });
    
    QUnit.test("Test key is generated", function (assert) {
        
        var baseSequence = parser.parseBidding("1M-2S");
        
        var sequenceMeta = matcher.composeSequenceMeta(baseSequence.bids);
        assert.equal(sequenceMeta['M'].length, 1);
        assert.equal(sequenceMeta['M'][0], 'H');
        
        var key = matcher.composeKey(baseSequence.bids);
        
        assert.equal(key['1H2S'], true);
        assert.equal(key['1S2S'], undefined);
    });
    
    QUnit.test("Test matching 1m-1M-1NT", function (assert) {
        
        var baseSequence = parser.parseBidding("1m-1M-1NT");
        var criteria = parser.parseBidding("1C-1S-1NT");
        
        assert.equal(matcher.isMatching(baseSequence.bids, criteria.bids), true);
    });
    
    QUnit.test("Test matching two way checkback", function (assert) {
        
        assert.equal(matcher.isMatching(parser.parseBidding("1m-1M-1NT-2D!-2M").bids, parser.parseBidding("1D-1S-1NT-2D-2S").bids), true);
        assert.equal(matcher.isMatching(parser.parseBidding("1m-1M-1NT-2D!-2M").bids, parser.parseBidding("1D-1S-1NT-2D-2H").bids), false);
    });
    
    QUnit.test("Test matching relay", function (assert) {
        
        assert.equal(matcher.isMatching(parser.parseBidding("1M-2M-2M+1").bids, parser.parseBidding("1H-2H-2S").bids), true);
        assert.equal(matcher.isMatching(parser.parseBidding("1M-2M-2M+2").bids, parser.parseBidding("1S-2S-3C").bids), true);
    });
    
    QUnit.test("Test matcher doesn't match 1H to 1m", function (assert) {

        var baseSequence = parser.parseBidding("1m");
        var criteria = parser.parseBidding("1H");
        
        assert.equal(matcher.isMatching(baseSequence.bids, criteria.bids), false);
    });
    
    QUnit.test("Test matcher filters lines", function (assert) {
        var input = 
        "#Entry for situation: 1\n"+
        "Opening bids\n"+
        "1C-?\n"+
        "\n"+
        "1D@normal:3+Cl, (11)12+HCP, open 1Cl if 33 in minors, N5CM\n"+
        "EXT@important:NV 2D/2M openings are QTxxx or better, with discouraged 3oM in 2M. V 2D/3m opening promises 2 of the top 3 honors in the suit.\n\n";
        
        // Act
        var result = parser.parse(input);
        var filtered1D = matcher.applyFilter(result[0], parser.parseBidding("1m-1D").bids);
        var filtered1M = matcher.applyFilter(result[0], parser.parseBidding("1m-1M").bids);
        
        assert.equal(filtered1D.length, 2, "Lines parsed");
        assert.deepEqual(filtered1M, [], "Lines parsed");
    });
    
    QUnit.test("Test matcher passes everything if no query", function (assert) {
        var input = 
        "#Entry for situation: 1\n"+
        "Opening bids\n"+
        "1C-?\n"+
        "\n"+
        "1D@normal:3+Cl, (11)12+HCP, open 1Cl if 33 in minors, N5CM\n"+
        "EXT@important:NV 2D/2M openings are QTxxx or better, with discouraged 3oM in 2M. V 2D/3m opening promises 2 of the top 3 honors in the suit.\n\n";
        
        // Act
        var result = parser.parse(input);
        var filtered = matcher.applyFilter(result[0], parser.parseBidding("").bids);
        
        assert.equal(filtered.length, 2, "Lines parsed");
    });
});
