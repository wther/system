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
define(['modules/parser', 'modules/renderer', 'modules/formatter', 'modules/admin', 'modules/matcher', 'modules/revisions', 'jquery'], function (parser, renderer, formatter, admin, matcher, revisions, $) {
    var handleException = function (e) {
        var text = 'An error occured';
        if (e.message !== undefined) {
            text = e.toString();
            $('#error_text').show();
        }

        if (e.line !== undefined) {
            text += " in line: " + e.line;
        }
        
        if(e.fileName !== undefined) {
            text += " in file: " + e.fileName;
        }
        
        console.log(e);

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
        hideError();
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
    var renderContent = function (content, revisionData) {
        
        if (content === undefined) {
            content = $('#editor').val();
        }
        
        if(revisionData === undefined){
            revisionData = [];
        }
        
        hideError();
        $('#rendered_content').html('');
        
        // Prepare search
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

        // Parse text
        try {
             // Parse revisions
            var revisionCache = revisions.parseRevisions(revisionData);
            var hash = revisions.revisionHash(revisionData);
            
            // Parse situations and render them as soon as they are parsed
            parser.parse(content, function(item, i){
                for(var j in item.lines){
                    var line = item.lines[j];
                    if(revisionCache[line.raw] !== undefined){
                        line['revision'] = hash[revisionCache[line.raw]];
                        line['revisionTitle'] = revisionCache[line.raw];
                    }
                }
                
                var div = $('<div>');
                div.attr('id', 'situation_wrapper_' + i);
                $('#rendered_content').append(div);
                
                // Render async
                renderer.renderSingleWithJQuery(item, div, function(situation){
                    return matcher.applyFilter(situation, filterBidding);
                });
            });       
        } catch (e) {
            handleException(e);
        }
                    
        // Show revisions
        var revisionDiv = renderer.renderRevisions(revisionData);
        $('#revision_content').html(revisionDiv.html());
    };

    /**
     * Saves content to resource URI
     */
    var saveContent = function () {
        var uri = $("#url").val().trim();

        var author = $("#author").val().trim();
        if (author === '')
            author = 'Anonymous';

        var token = $('#token').val();
        var content = $('#editor').val();
        
        // Make backup copy
        localStorage.setItem("systembackup-" + token, content);

        $('#save_button').attr('disabled', 'disabled');
        admin.save(uri, author, token, content, function (data) {
            if (data.errorMessage !== undefined) {
                alert(data.errorMessage);
            } else {
                alert("Saved successfully!");
            }
            $('#save_button').removeAttr('disabled');
        });
    };
    
    var setupRecover = function() {
        $('#recover_button').click(function(){
             
            // The recover button recovers content from the JS
            // localstorage stored with the token.
            var token = $('#token').val();
            var content = localStorage.getItem("systembackup-" + token);
            
            if(content !== undefined){
                if(window.confirm("Are you sure you want to override the editor with content in your local storage? Changes will only be permanent when you save.")){
                    $('#editor').val(content);
                }
            } else {
                alert("There is no local save in your local storage. Sorry.");
            }
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
        
        setupRecover();
    };

    var setupWithoutEditor = function () {
        // Load system from location
        $(function () {
            admin.fetch($('#url').val(), function (data) {
                // Show content
                localStorage.setItem('content', data.latest.content);
                localStorage.setItem('revisions', JSON.stringify(data.revisions));
                
                renderContent(data.latest.content, data.revisions);
            });
        });
    };
    
    var setupSearch = function() {
        $('#search').keyup(function(){
            if(localStorage.getItem('content') !== undefined){
                renderContent(localStorage.getItem('content'), JSON.parse(localStorage.getItem('revisions')));
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
    };
});