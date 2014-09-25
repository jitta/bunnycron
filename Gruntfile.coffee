module.exports = (grunt) ->
  grunt.initConfig
    watch:
      coffee:
        files: ['src/**/*.coffee']
        tasks: 'coffee'
    coffee:
      compile:
        files: [
          expand: true
          cwd: "./src"
          src: ["**/*.coffee"]
          dest: "lib"
          ext: ".js"       
        ]
  grunt.loadNpmTasks 'grunt-contrib-coffee'
  grunt.loadNpmTasks 'grunt-contrib-watch'
  grunt.registerTask 'default', ['coffee']