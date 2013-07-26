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

    var defaultLintSettings = {
        customAttributes: true, // Validate custom attributes
        selfClosingTags: true, // Validate self closing tags,
        documentEncoding: true, // Validates for whether or not the document has a character encoding declared,
        requiredChildren: true, // Validates that elements have the required children,
        startTagBeforeDocType: true, // Validates that start tags are not before doctypes,
        strayEndTag: true, // Validates for stray end tags,
        forLabelControl: true, // Validates that the for attribute on the label points to a control
        imgAlt: true, // Validates that img tags have an alt attribute,
        invalidValue: true, // Validates for invalid values for attributes
        unclosedElement: true, // Validates for unclosed elements
        invalidChildElements: true, // Validates that elements have valid child elements
        openElements: true // Validates that there are open elements before a parents close tag
    };

    var filters = {
        customAttributes: /Attribute ["“][^"”]+["”] not allowed/,
        selfClosingTags: /Self-closing syntax \(["“]\/>["”]\) used on a non-void HTML element/,
        documentEncoding: /The character encoding of the document was not declared/,
        requiredChildren: /Element ["“][^"”]+["”] is missing a required instance of child element ["“][^"”]+["”]/,
        startTagBeforeDocType: /Start tag seen without seeing a doctype first/,
        strayEndTag: /Stray end tag ["“][^"”]+["”]/,
        forLabelControl: /The "for" attribute of the "label" element must refer to a form control/,
        imgAlt: /An "img" element must have an "alt" attribute/,
        invalidValue: /Bad value ["“][^"”]+["”] for attribute ["“][^"”]+["”] on element ["“][^"”]+["”]/,
        unclosedElement: /Unclosed element ["“][^"”]+["”]/,
        invalidChildElements: /Element ["“][^"”]+["”] not allowed as child of element ["“][^"”]+["”] in this context/,
        openElements: /End tag ["“][^"”]+["”] seen, but there were open elements/
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
     * Simple function to just return true
     * @returns {boolean}
     */
    function returnTrueFn() {
        return true;
    }

    /**
     * Formats the result into a user readable format
     * @param result The actual result
     * @returns {string}
     */
    function formatResult(result) {
        return "\t" + ((result.firstLine || result.lastLine) + "." + result.firstColumn + "-" + result.lastLine + "." + result.lastColumn) + ": " + result.type + ": " + result.message;
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
        var validationFilter;
        for (var lintOption in lintOptions) {
            filter = filters[lintOption];
            validationFilter = validationFilters[lintOption] || returnTrueFn;
            if (lintOptions.hasOwnProperty(lintOption) &&
                lintOptions[lintOption] &&
                filter &&
                fileResult.message.match(filter) &&
                validationFilter(fileUrl, fileResult)) {
                results.push(formatResult(fileResult));
            }
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

            var lintOptions = extend(extend({}, defaultLintSettings), options);
            var validationFilters = options.validationFilters || {};
            var actualResult = [];

            for (var i = 0; i < result.length; i++) {
                var fileUrl = result[i].url;
                var fileResults = result[i].messages;
                var fileActualResults = [];
                for (var j = 0; j < fileResults.length; j++) {
                    var fileResult = fileResults[j];
                    if (fileResult.type !== "info") {
                        filterAndAddResult(fileResult, fileUrl, lintOptions, validationFilters, fileActualResults);
                    }
                }
                if (fileActualResults.length) {
                    actualResult.push(fileUrl + ":");
                    actualResult = actualResult.concat(fileActualResults);
                }
            }

            if (!actualResult.length) {
                grunt.log.writeln(files.length + ' file(s) valid');
                done();
                return;
            }
            grunt.log.writeln(actualResult.join('\n'));
            done(false);
        });
    });

};
