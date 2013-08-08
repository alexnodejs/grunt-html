# grunt-html

[Grunt][grunt] plugin for html validation, using [Mike Smith's vnu.jar][vnujar].

## Getting Started
Install this grunt plugin next to your project's [Gruntfile.js gruntfile][getting_started] with: `npm install grunt-html --save-dev`

Then add this line to your project's `Gruntfile.js`:

```javascript
grunt.loadNpmTasks('grunt-html');
```

Then specify what files to validate in your config:

```javascript
grunt.initConfig({
	htmllint: {
		all: ["demos/**/*.html", "tests/**/*.html"]
	}
});
```

For fast validation, keep that in a single group, as the validator initialization takes a few seconds.

[grunt]: https://github.com/gruntjs/grunt
[getting_started]: https://github.com/gruntjs/grunt/wiki/Getting-started
[vnujar]: https://bitbucket.org/sideshowbarker/vnu/

### Linting Options
The validation engine outputs many different type of validation errors, however, only a subset is supported:

_customAttributes_ - /Attribute "[^"]*" not allowed/

_selfClosingTags_ - /Self-closing syntax \("\/>"\) used on a non-void HTML element/

_documentEncoding_ - /The character encoding of the document was not declared/

_requiredChildren_ - /Element "[^"]*" is missing a required instance of child element "[^"]*"/

_startTagBeforeDocType_ - /Start tag seen without seeing a doctype first/

_strayEndTag_ - /Stray end tag "[^"]*"/

_forLabelControl_ - /The "for" attribute of the "label" element must refer to a form control/

_requiredAttribute_ - /An "[^"]*" element must have an "[^"]*" attribute/

_invalidValue_ - /Bad value "[^"]*" for attribute "[^"]*" on element "[^"]*"/

_unclosedElement_ - /Unclosed element "[^"]*"/

_invalidChildElements_ - /Element "[^"]*" not allowed as child of element "[^"]*" in this context/

_openElements_ - /End tag "[^"]*" seen, but there were open elements/

_obsoleteAttribute_ - /The "[^"]*" attribute on the "[^"]*" element is obsolete/

_obsoleteElement_ - /The "[^"]*" element is obsolete/

_rcdataString_ - /RCDATA element "[^"]*" contained the string/

_endTagInvalidNesting_ - /End tag "[^"]*" violates nesting rules/

_sawExpecting_ - /Saw "[^"]*" when expecting an attribute name/,

_selfClosingTagNotSelfClosed_ - /A slash was not immediately followed by "[^"]*"/

#### Usage
Using lint options requires the use of an alternate syntax in the htmllint config.

```javascript
grunt.initConfig({
	htmllint: {
		all: {
	        options: {
	            customAttributes: false, // Disables the validation for customAttributes
	            documentEncoding: false, // Disables the validation for documentEncoding
	            startTagBeforeDocType: false, // Disables the validation for startTagBeforeDocType
	            validationFilters: { // Custom filters which return whether or not the error is truly a validation issue
	                requiredChildren: function (url, error) {
	                    return url.indexOf(".tpl.html") < 0; // Errors about required children on files that end with tpl.html should be ignored.
	                },
	                invalidValue: function (url, error) {
	                    return error.message.indexOf("{{") < 0; // Errors about invalid attribute values that contain {{ should be ignored.
	                },
	                forLabelControl: function (url, error) {
	                    return error.extract.indexOf("{{") < 0;
	                },
	                unknownValidation: function (url, error) { // A catch all handler for all unknown validation errors, which allow for you to run your own validation code.
	                    return false; // Ignore all unknown errors
	                }
	            }
	        },
			files: {
	            src: [
	                '**/*.html',
	                '!vendor/**/*.html'
	            ]
	        }
		}
	}
});
```

## License
Copyright (c) 2012 Jörn Zaefferer
Licensed under the MIT license.
