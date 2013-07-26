
var util = require('util');
var fs = require("fs");
module.exports = function(grunt, files, done) {
  var jar = __dirname + '/../vnu.jar';
  grunt.util.spawn({
    cmd: 'java',
    args: ['-Dnu.validator.client.out=json','-jar', jar].concat(files)
  }, function(error, output) {
    if (error) {
      done(error);
      return;
    }
    done(null, JSON.parse("[" + output.toString().replace(/\n/g, ",") + "]"));
  });
};