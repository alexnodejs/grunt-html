/*
 * grunt-html
 * https://github.com/jzaefferer/grunnt-html
 *
 * Copyright (c) 2012 Jörn Zaefferer
 * Licensed under the MIT license.
 */

var htmllint = require('../lib/htmllint');

module.exports = function (grunt) {
    "use strict";

    var filters = {
        customAttributes: /Attribute "[^"]*" not allowed/,
        selfClosingTags: /Self-closing syntax \("\/>"\) used on a non-void HTML element/,
        documentEncoding: /The character encoding of the document was not declared/,
        requiredChildren: /Element "[^"]*" is missing a required instance of child element "[^"]*"/,
        startTagBeforeDocType: /Start tag seen without seeing a doctype first/,
        strayEndTag: /Stray end tag "[^"]*"/,
        forLabelControl: /The "for" attribute of the "label" element must refer to a form control/,
        requiredAttribute: /An "[^"]*" element must have an "[^"]*" attribute/,
        invalidValue: /Bad value "[^"]*" for attribute "[^"]*" on element "[^"]*"/,
        unclosedElement: /Unclosed element "[^"]*"/,
        invalidChildElements: /Element "[^"]*" not allowed as child of element "[^"]*" in this context/,
        openElements: /End tag "[^"]*" seen, but there were open elements/,
        obsoleteAttribute: /The "[^"]*" attribute on the "[^"]*" element is obsolete/,
        obsoleteElement: /The "[^"]*" element is obsolete/,
        rcdataString: /RCDATA element "[^"]*" contained the string/,
        endTagInvalidNesting: /End tag "[^"]*" violates nesting rules/
    };

    // Maps validation types to colors
    var typeToColor = {
        info: "blue",
        error: "red",
        warning: "yellow"
    };

    /**
     * Quick function to mixin source into target
     * @param target The target object
     * @param source The source object
     * @returns {*}
     */
    function extend (target, source) {
        target = target || {};
        for (var prop in source) {
            if (typeof source[prop] === 'object') {
                target[prop] = extend(target[prop], source[prop]);
            } else {
                target[prop] = source[prop];
            }
        }
        return target;
    }

    /**
     * Formats the result into a user readable format
     * @param result The actual result
     * @returns {string}
     */
    function formatResult(result) {
        var message = result.type + (result.subType ? " " + result.subType : "") +  ": " + result.message;
        if(result.firstLine !== undefined || result.lastLine !== undefined) {
            message = ((result.firstLine || result.lastLine) + "." + (result.firstColumn || 0) + "-" + result.lastLine + "." + result.lastColumn) + ": " + message;
        }
        return "\t" + message[typeToColor[result.type + (result.subType || "")]];
    }

    /**
     * Filters the current file result against the lint options/validation filters
     * @param fileResult The validation result from the validator
     * @param fileUrl The source url
     * @param lintOptions The lint options to filter against
     * @param validationFilters The functions which indicate whether or not a lint validation error is truly an error
     * @param results The results array to add the result to if the validation fails
     */
    function filterAndAddResult(fileResult, fileUrl, lintOptions, validationFilters, results) {
        var filter;
        var fileMessage = fileResult.message = fileResult.message.replace(/[“”]/g, "\"");
        var doAdd = true;
        var validationFilter = validationFilters.unknownValidation;
        for (var filterName in filters) {
            filter = filters[filterName];
            if (fileMessage.match(filter)) { // If this message is for this filter
                doAdd = (!lintOptions.hasOwnProperty(filterName) || lintOptions[filterName] !== false);  // If this error message isn't turned off
                validationFilter = validationFilters[filterName];
                break;
            }
        }

        if (doAdd && (!validationFilter || validationFilter(fileUrl, fileResult))) {
            results.push(formatResult(fileResult));
        }
    }

    grunt.registerMultiTask('htmllint', 'Validate html files', function () {
        var done = this.async(),
            files = grunt.file.expand(this.filesSrc),
            options = this.options();

        htmllint(grunt, files, function (error, result) {
            if (error) {
                grunt.log.error(error);
                done(false);
                return;
            }

            var lintOptions = extend({}, options);
            var validationFilters = options.validationFilters || {};
            var actualResult = [];

            for (var i = 0; i < result.length; i++) {
                var fileUrl = result[i].url;
                var fileResults = result[i].messages;
                var fileActualResults = [];
                for (var j = 0; j < fileResults.length; j++) {
                    var fileResult = fileResults[j];
                    filterAndAddResult(fileResult, fileUrl, lintOptions, validationFilters, fileActualResults);
                }
                if (fileActualResults.length) {
                    actualResult.push(fileUrl + ":");
                    actualResult = actualResult.concat(fileActualResults);
                }
            }

            if (!actualResult.length) {
                grunt.log.writeln(files.length + ' valid file(s)');
                done();
                return;
            }
            grunt.log.writeln(actualResult.join('\n'));
            done(false);
        });
    });

};
