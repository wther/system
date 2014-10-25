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
 * Main module
 */
define(['modules/parser', 'modules/renderer', 'modules/formatter', 'modules/admin', 'modules/matcher', 'jquery'], function (parser, renderer, formatter, admin, matcher, $) {
    var handleException = function (e) {
        var text = 'An error occured';
        if (e.message !== undefined) {
            text = e.toString();
            $('#error_text').show();
        }

        if (e.line !== undefined) {
            text += " in line: " + e.line;
        }

        $('#error_text').html(text);
        throw e;
    };

    var hideError = function () {
        $('#error_text').hide();
        $('#error_text').html('');
    };

    /**
     * Event handler for the "Make it pretty!"
     */
    var formatContent = function () {
        var content = $('#editor').val();

        // Parse text
        try {
            var situations = parser.parse(content);
        } catch (e) {
            handleException(e);
        }

        $('#editor').val('');

        var text = '';
        for (var entryId in situations) {
            text += formatter.formatSituation(situations[entryId]);
        }

        $('#editor').val(text);
    };

    /**
     * Renders content again
     * 
     * @returns {undefined}
     */
    var renderContent = function (content) {
        if (content === undefined) {
            var content = $('#editor').val();
        }

        hideError();
        $('#rendered_content').html('');

        // Parse text
        try {
            var situations = parser.parse(content);
        } catch (e) {
            handleException(e);
        }
        
        var filter = $('#search').val();
        if(filter === undefined){
            filter = '';
        }
        
        // Step backwards to the first valid filter
        var currentFilter = filter;
        var filterBidding;
        for(var i = filter.length; i >= 0; i--){
            try {
                var filterBidding = parser.parseBidding(currentFilter).bids;
                break;
            } catch (e){
                currentFilter = currentFilter.substr(0, currentFilter.length-1);
            }
        }
        
        try {
            renderer.renderWithJQuery(situations, $('#rendered_content'), function(situation){
                return matcher.applyFilter(situation, filterBidding);
            });
        } catch (e) {
            handleException(e);
        }
    };

    /**
     * Saves content to resource URI
     */
    var saveContent = function () {
        var uri = $("#url").val().trim();

        var author = $("#author").val().trim();
        if (author == '')
            author = 'Anonymous';

        var token = $('#token').val();
        var content = $('#editor').val();

        $('#save_button').attr('disabled', 'disabled');
        admin.save(uri, author, token, content, function (data) {
            if (data.errorMessage !== undefined) {
                alert(data.errorMessage);
            }
            $('#save_button').removeAttr('disabled');
        });
    };

    var setupWithEditor = function () {
        // What happens when clicking the "Make it pretty!" button?
        $('#pretty_button').click(formatContent);

        // What happens when clicking the save button?
        $('#save_button').click(saveContent);

        // What happens on the render button?
        $('#render_button').click(function(){
            renderContent();
        });

        // Load system from location
        $(function () {
            admin.fetch($('#url').val(), function (data) {
                $('#editor').removeAttr('readonly');
                $('#editor').val(data.latest.content);
                renderContent();
            });
        });
    };

    var setupWithoutEditor = function () {
        // Load system from location
        $(function () {
            admin.fetch($('#url').val(), function (data) {
                renderContent(data.latest.content);
            });
        });
    };
    
    var setupSearch = function() {
        $('#search').keyup(function(){
            if(localStorage.getItem('content') !== undefined){
                renderContent(localStorage.getItem('content'));
            }
        });
    };

    return {
        saveContent: saveContent,
        renderContent: renderContent,
        formatContent: formatContent,
        setupWithEditor: setupWithEditor,
        setupWithoutEditor: setupWithoutEditor,
        setupSearch: setupSearch
    }
});

