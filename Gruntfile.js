module.exports = grunt => {
  require('time-grunt')(grunt);
  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    watch: {
      bot: {
        files: ['index-cube.js', 'app/**/*.js'],
        tasks: ['xo', 'spawnProcess:bot'],
        options: {
          spawn: false
        }
      }
    },
    spawnProcess: {
      bot: {
        args: ['index-cube.js', '--color']
      }
    },
    xo: {
      target: ['index-cube.js', 'app/**/*.js']
    }
  });

  grunt.registerTask('default', 'start');
  grunt.registerTask('start', ['xo', 'spawnProcess:bot', 'watch']);
};