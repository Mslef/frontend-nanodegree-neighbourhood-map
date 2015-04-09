module.exports = function(grunt) {

  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    // Remove unused CSS
    uncss: {
       dist: {
         option:{
           stylesheets:['../css/style.min.css']
         },
         files: {
           'dist/css/style.css': ['index.html']
         }
       }
     },

     // Minimize CSS
     cssmin: {
       css: {
         expand: true,
         src: ['dist/css/*.css', '!*min.css'],
         ext:'.min.css'
       }
     },

    // Minimize JS
    uglify: {
      js: {
        files: {
            'dist/script/main.min.js': ['script/main.js']
        }
      }
    },
  });

  grunt.registerTask('default', ['uncss','cssmin', 'uglify']);

};
