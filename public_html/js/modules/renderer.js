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
 * Table renderer for bidding
 */
define(['jquery'], function ($) {

    var RenderError = function (message) {
        this.message = message;
    };

    RenderError.prototype.toString = function () {
        return this.message;
    };

    /**
     * Private utility function for collapseCells
     */
    var setHeightOfCurrentHeadAndGoDeeper = function (cells, fromX, y, currentHead, collapseCellsFunc) {
        if (cells[currentHead][fromX] !== undefined) {
            cells[currentHead][fromX].height = y - currentHead;

            // Collapse all children
            if (fromX < cells[currentHead].length - 1 && currentHead + 1 < y) {
                collapseCellsFunc(cells, fromX + 1, currentHead, y);
            }
        }
    }

    /**
     * Private function to collapse matching cells
     */
    var collapseCells = function (cells, fromX, fromY, toY) {

        // Current head is the cell for witch we're inspecting rowspan
        var currentHead = fromY;
        for (var y = fromY + 1; y < toY; ) {

            // Current row is real
            var condition = cells[y] !== undefined;

            // Current row might be matching the previous one
            condition = condition && cells[y][fromX] !== undefined;

            // Previous row is real
            condition = condition && cells[currentHead][fromX] !== undefined;

            // They match indeed
            condition = condition && cells[currentHead][fromX].value == cells[y][fromX].value;

            // This cell is matching the current head then is collapsed
            if (condition) {
                cells[y][fromX].height = 0;

                // Step one
                y++;

                // This cell doesn't match the current head, then set current head's
                // rowspan accordingly and start over from next row
            } else {
                setHeightOfCurrentHeadAndGoDeeper(cells, fromX, y, currentHead, collapseCells);

                // Step two
                currentHead = y;
                y = currentHead + 1;
            }
        }

        setHeightOfCurrentHeadAndGoDeeper(cells, fromX, y, currentHead, collapseCells);
    };

    /**
     * Renders as HTML
     */
    var prepareCells = function (input) {

        var cells = [];

        var longestSequence = 0;
        
        var hasAnyNotExtension = false;
        
        // Fill in cells best effort
        for (i in input) {
            var row = [];
            var sequence = input[i].bidding.sequence;

            if (sequence !== undefined && sequence.length > 0 && sequence[0] == 'EXT') {
                continue;
            }
            
            hasAnyNotExtension = true;

            longestSequence = Math.max(longestSequence, sequence.length + 1);

            for (j in sequence) {
                var bid = sequence[j];
                row[row.length] = {
                    value: bid,
                    tag: input[i].tag,
                    height: 1
                };
            }

            row[row.length] = {
                value: input[i].explanation,
                tag: input[i].tag,
                height: 1
            };

            cells[cells.length] = row;
        }

        cells['width'] = longestSequence;


        // Collapse cells
        if(hasAnyNotExtension){
            collapseCells(cells, 0, 0, cells.length);
        }

        return cells;
    };

    /**
     * How should we render cells
     */
    var defaultCellRenderer = function (cellText) {
        var raw = cellText.replace(/!/g, '');
        raw = raw.replace(/([1-7])C/g, '$1&clubs;');
        raw = raw.replace(/([1-7])S/g, '$1&spades;');
        raw = raw.replace(/([1-7])D/g, '$1<span class="red">&diams;</span>');
        raw = raw.replace(/([1-7])H/g, '$1<span class="red">&hearts;</span>');
        raw = raw.replace(/([1-7])N/g, '$1NT');
        return raw;
    };
    
    var defaultTextRenderer = function text(raw){
        raw = raw.replace(/\!C/g, '&clubs;');
        raw = raw.replace(/\!S/g, '&spades;');
        raw = raw.replace(/\!D/g, '<span class="red">&diams;</span>');
        raw = raw.replace(/\!H/g, '<span class="red">&hearts;</span>');
        return raw;
    };

    /**
     * Renders cells as HTML
     * @param {type} cells
     * @returns JQuery Object
     */
    var renderCells = function (cells, cellRenderer, textRenderer) {

        if (cellRenderer === undefined) {
            cellRenderer = defaultCellRenderer;
        };
        
        if(textRenderer === undefined){
            textRenderer = defaultTextRenderer;
        }

        var table = $('<table>');

        var tableWidth = cells.width;

        for (var y = 0; y < cells.length; y++) {
            var row = $('<tr>');
            for (var x = 0; x < cells[y].length; x++) {
                // If this cell should be collapsed, just skip it
                if (cells[y][x].height > 0) {
                    var cell = $('<td>');

                    // Set the colspan to the previously calculated value
                    if (cells[y][x].height > 1) {
                        cell.attr('rowspan', cells[y][x].height);
                    }

                    // In case this is the last cell
                    if (x == cells[y].length - 1 && tableWidth - x >= 1) {
                        cell.attr('colspan', tableWidth - x);
                    }

                    if (x == cells[y].length - 1) {
                        cell.addClass('cell-explain');
                    } else {
                        cell.addClass('cell-bid');
                    }
                    cell.addClass('cell');

                    // Add tags as class, but only if colspan is 1
                    if (cells[y][x].height == 1 && cells[y][x].tag !== undefined) {
                        for (key in cells[y][x].tag) {
                            cell.addClass(cells[y][x].tag[key]);
                        }
                    }

                    if(x == cells[y].length - 1){
                        cell.html(textRenderer(cells[y][x].value));
                    } else {
                        cell.html(cellRenderer(cells[y][x].value));
                    }
                    
                    row.append(cell);
                }
            }

            table.append(row);
        }

        return table;
    };

    /**
     * Render only rows with extensions
     */
    var renderExtensions = function (input, textRenderer) {
        var div = $('<div>');
        div.addClass('extensions-wrapper');
        
        if(textRenderer === undefined){
            textRenderer = defaultTextRenderer;
        }

        // Iterate through all rows only searching for extensions
        for (i in input) {
            var sequence = input[i].bidding.sequence;

            if (sequence.length == 0 || sequence[0] != 'EXT') {
                continue;
            }

            var current = input[i];

            var row = $('<div>');
            for (key in current.tag) {
                row.addClass('extension extension-' + current.tag[key]);
            }

            row.html(textRenderer(current.explanation));
            div.append(row);
        }

        return div; 
    };

    var renderWithJQuery = function (situations, jqueryDestination, filterLinesFunction, textRenderer) {
        
        if(filterLinesFunction === undefined){
            return function(data){
                // Default is that there is no actual 
                return data.lines;
            }
        };
        
        if(textRenderer === undefined){
            textRenderer = defaultTextRenderer;
        }

        // Render each situation
        for (situationId in situations) {
            var div = $('<div>');
            div.attr('id', 'situation_wrapper_' + situationId);
            div.addClass('situation-wrapper');

            var head = $('<h2>');
            head.addClass('situation-header');
            head.html(textRenderer(situations[situationId].title));
            div.append(head);
            
            var cells = prepareCells(filterLinesFunction(situations[situationId]));
            var extensionDiv = renderExtensions(situations[situationId].lines);
            
            if(cells.length == 0 && extensionDiv.is(':empty')){
                continue;
            }

            var table = renderCells(cells);
            table.addClass('table table-bordered situation-table');
            div.append(table);

            div.append(extensionDiv.html());
            $(jqueryDestination).append(div); 
        }
    };

    return {
        prepareCells: prepareCells,
        renderCells: renderCells,
        renderExtensions: renderExtensions,
        defaultCellRenderer: defaultCellRenderer,
        defaultTextRenderer: defaultTextRenderer,
        renderWithJQuery: renderWithJQuery
    };
});