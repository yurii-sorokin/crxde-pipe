'use strict';

module.exports = function(grunt) {

  var fs = require('fs');
  var pkg = require('./package.json');

  // Project configuration.
  grunt.initConfig({
    pkg: pkg,
    watch: {
      file: [ 'Gruntfile.js' ]
    },
    jsdoc2md: {
      lib: {
        options: {
          template: fs.readFileSync('README.tl.hbs').toString('utf-8')
        },
        src: 'lib/*.js',
        dest: 'README.md'
      }
    }
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-jsdoc-to-markdown');

  // Default task.
  grunt.registerTask('default', ['jsdoc2md']);

};
