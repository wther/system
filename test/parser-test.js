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

require(['modules/parser'], function (parser) {
    
    QUnit.module( "Line Parser" );
        
    // Test parsing single lines
    QUnit.test("Test parsing 1C", function (assert) {
        var inputString = "1C@normal:3+Cl, (11)12+HCP, open 1Cl if 33 in minors, N5CM";

        // Act
        var result = parser.parseLine(inputString);

        // Assert
        assert.deepEqual(result.tag, ['normal'], "Tag parsed");
        assert.deepEqual(result.bidding.sequence, ['1C'], "Sequence parsed");
        assert.deepEqual(result.explanation, '3+Cl, (11)12+HCP, open 1Cl if 33 in minors, N5CM', "Explanation parsed");
    });

    QUnit.test("Test parsing 1C-1X-1NT", function (assert) {
        var inputString = "1C-1X-1NT@normal:3+Cl, (11)12+HCP, open 1Cl if 33 in minors, N5CM";
        
        // Act
        var result = parser.parseLine(inputString);
        
        // Assert
        assert.deepEqual(result.bidding.sequence, ['1C', '1X', '1N'], "Sequence parsed");
    });
    
    QUnit.test("Test parsing 1X-Pass-1S-Dbl-Rdbl", function (assert) {
        var inputString = "1X-Pass-1S-Dbl-Rdbl@normal:3+Cl, (11)12+HCP, open 1Cl if 33 in minors, N5CM";

        // Act
        var result = parser.parseLine(inputString);
        
        // Assert
        assert.deepEqual(result.bidding.sequence, ['1X', 'Pass', '1S', 'Dbl', 'Rdbl'], "Sequence parsed");
    });
    
    QUnit.test("Test parsing 1m-1M-2m-2m+1-2M", function (assert) {
        var inputString = "1m-1M-2m-2m+1-2M@normal:2-3M, WK, 2NT/3m is TP other bids are GF, 3M is asking to bid 4M with 3 card support";
        
        // Act
        var result = parser.parseLine(inputString);
        
        // Assert
        assert.deepEqual(result.bidding.sequence, ['1m', '1M', '2m', '2m+1', '2M'], "Sequence parsed");
        assert.deepEqual(result.bidding.bids[3][0].transform, '+1', "Partial sequence parsed");
    });

    QUnit.test("Test parsing 1C with illegal suit symbol (1Cl) passes", function (assert) {
        var inputString = "1C@normal:3+Cl, (11)12+HCP, open 1Cl if 33 in minors, N5CM";

        // Act
        var result = parser.parseLine(inputString);
        
        // Assert
        assert.deepEqual(result.bidding.sequence, ['1C'], "Sequence parsed");
    });
    
    QUnit.test("Test parsing 2D-2H-2N/3C passes", function (assert) {
        var inputString = "2D-2H-2N/3C@normal:INV+, 4+Cl/D, 55+ if only INV";

        // Act
        var result = parser.parseLine(inputString);
        
        // Assert
        assert.deepEqual(result.bidding.sequence, ['2D', '2H', '2N/3C'], "Sequence parsed")
        assert.deepEqual(result.bidding.bids[0][0].value, '2D', "2D parsed");;
        assert.deepEqual(result.bidding.bids[1][0].value, '2H', "2H parsed");
        assert.deepEqual(result.bidding.bids[2][0].value, '2N', "Partial sequence parsed");
        assert.deepEqual(result.bidding.bids[2][1].value, '3C', "Partial sequence parsed");
    });
    
    QUnit.test("Test parsing 1M-(Dbl/2D)-3S/4m+1/4H!", function (assert) {
        var inputString = "1M-(Dbl/2D)-3S/4m+1/4H!@normal:SPL";

        // Act
        var result = parser.parseLine(inputString);
        
        // Assert
        assert.deepEqual(result.bidding.sequence, ['1M', '(Dbl/2D)', '3S/4m+1/4H!'], "Sequence parsed");
        assert.deepEqual(result.bidding.bids[0][0].value, '1M', "1M parsed correctly");
        assert.deepEqual(result.bidding.bids[1][0].value, 'Dbl', "Double parsed correctly");
        assert.deepEqual(result.bidding.bids[2][0].value, '3S', "Partial sequence parsed");
        assert.deepEqual(result.bidding.bids[2][1].value, '4m', "Partial sequence parsed");
        assert.deepEqual(result.bidding.bids[2][1].transform, '+1', "Partial sequence transform parsed");
        assert.deepEqual(result.bidding.bids[2][2].value, '4H', "Partial sequence parsed");
        assert.deepEqual(result.bidding.bids[2][2].exact, true, "Partial sequence meta parsed");
    });
    
    QUnit.test("Test parsing 1C with illegal symbol fails", function (assert) {
        var inputString = "1P@normal:3+Cl, (11)12+HCP, open 1Cl if 33 in minors, N5CM";
        assert.throws(function(){parser.parseLine(inputString)}, parser.ParseError, "Exception thrown");
    });
    
    QUnit.test("Test parsing EXT passes", function (assert) {
        var inputString = "EXT@important:If 2Cl bid is overcalled or doubled...";

        // Act
        var result = parser.parseLine(inputString);

        // Assert
        assert.deepEqual(result.bidding.sequence, ['EXT'], "Sequence parsed as extension");
    });
    
    QUnit.test("Test parsing 1N-2D over 2C-2M", function (assert) {
        
        var inputString = "1N-2D over 2C-2M!@normal:SPL";

        // Act
        var result = parser.parseLine(inputString);
        
        // Assert
        assert.deepEqual(result.bidding.sequence, ['1N', '2D over 2C', '2M!'], "Sequence parsed");
        assert.deepEqual(result.bidding.bids[0][0].value, '1N', "1NT parsed correctly");
        assert.deepEqual(result.bidding.bids[1][0].value, '2C', "2C parsed correctly");
        assert.deepEqual(result.bidding.bids[2][0].value, '2D', "2D parsed correctly");
        assert.deepEqual(result.bidding.bids[3][0].value, '2M', "2D parsed correctly");        
    });
    
    QUnit.test("Test parsing 1M-(Dbl)-2M-1", function (assert) {
        
        var inputString = "1M-(Dbl)-2M-1@normal:3=M, (7)8-10HCP, from passed hand this is Drury, 3M INV";

        // Act
        var result = parser.parseLine(inputString);
        
        // Assert
        assert.deepEqual(result.bidding.sequence, ['1M', '(Dbl)', '2M-1'], "Sequence parsed");
        assert.deepEqual(result.bidding.bids[0][0].value, '1M', "1M parsed correctly");
        assert.deepEqual(result.bidding.bids[1][0].value, 'Dbl', "Dbl parsed correctly");
        assert.deepEqual(result.bidding.bids[2][0].value, '2M', "2M parsed correctly");
        assert.deepEqual(result.bidding.bids[2][0].transform, '-1', "2M's tranform parsed correctly");
    });
    
    //2C-Over 2D-2H@important:P/C, can be 3Sp-4H-5+Cl weak (he will bid 3Cl over 1NT-2Cl-2D-2H-2Sp)
    QUnit.test("Test parsing 2C-Over 2D-2H:P/C", function (assert) {
        
        var inputString = "2C-Over 2D-2H@important:P/C";

        // Act
        var result = parser.parseLine(inputString);
        
        // Assert
        assert.deepEqual(result.bidding.sequence, ['2C', 'Over 2D', '2H'], "Sequence parsed");
        assert.deepEqual(result.bidding.bids[0][0].value, '2C', "2C parsed correctly");
        assert.deepEqual(result.bidding.bids[1][0].value, '2D', "2D parsed correctly");
        assert.deepEqual(result.bidding.bids[2][0].value, '2H', "2H parsed correctly");
    });
    
    //1m-1M-1N-2D over 2C!-3C!@normal:NAT, INV, 4M
    QUnit.test("Test parsing 1m-1M-1N-2D over 2C!-3C", function (assert) {
        var inputString = "1m-1M-1N-2D over 2C!-3C!@normal:NAT, INV, 4M";

        // Act
        var result = parser.parseLine(inputString);
        
        // Assert
        assert.deepEqual(result.bidding.sequence, ['1m', '1M', '1N', '2D over 2C!', '3C!'], "Sequence parsed");
    });
    
    //1m-1M-1NT-2D over 2C!-2NT:5M INV, m tolerance, 3m:TP
        QUnit.test("Test parsing with no tag", function (assert) {
        var inputString = "1m-1M-1N:NAT, INV, 4M";

        // Act
        var result = parser.parseLine(inputString);
        
        // Assert
        assert.deepEqual(result.bidding.sequence, ['1m', '1M', '1N'], "Sequence parsed");
    });
    
    
    QUnit.module( "Full Parser" );
    QUnit.test("Test simple parsing", function (assert) {
        var input = 
        "#Entry for situation: 1\n"+
        "Opening bids\n"+
        "*\n"+
        "\n"+
        "1C@normal:3+Cl, (11)12+HCP, open 1Cl if 33 in minors, N5CM\n"+
        "EXT@important:NV 2D/2M openings are QTxxx or better, with discouraged 3oM in 2M. V 2D/3m opening promises 2 of the top 3 honors in the suit.\n\n";
        
        // Act
        var result = parser.parse(input);
        
        result = result[0];
        
        assert.equal(result.title, 'Opening bids', "Title parsed");
        assert.deepEqual(result.baseBidding.sequence, [], "Base sequence parsed");
        assert.equal(result.lines.length, 2, "Lines parsed");
    });
});

