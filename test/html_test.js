var grunt = require('grunt'),
  htmllint = require('../lib/htmllint');

exports['htmllint'] = {
  'helper': function(test) {
    "use strict";
    test.expect(1);
    // tests here
    htmllint(grunt, ['test/valid.html', 'test/invalid.html'], function(error, result) {
      if (error) {
        throw error;
      }
      test.deepEqual(result, [
        'test/invalid.html',
        '\t10.1-10.81: error: An "img" element must have an "alt" attribute, except under certain conditions. For details, consult guidance on providing text alternatives for images.',
        '\t12.1-12.19: error: The "clear" attribute on the "br" element is obsolete. Use CSS instead.',
        '\tinfo warning: The character encoding of the document was not declared.'
      ], 'three errors from test/invalid.html');
      test.done();
    });
  }
};
