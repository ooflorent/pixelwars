module.exports = function(grunt) {

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-compress');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-htmlmin');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.loadTasks('tasks');

  var processedConstants = Object.create(null);
  var rawConstants = grunt.file.readJSON('src/constants.json');

  for (var c in rawConstants) {
    processedConstants['__PW_' + c] = rawConstants[c];
  }

  var files = {
    engine: [
      '<%= dirs.engine %>/objects.js',
      '<%= dirs.engine %>/utils.js',
      '<%= dirs.engine %>/input.js',
      '<%= dirs.engine %>/managers/eventmanager.js',
      '<%= dirs.engine %>/managers/entitymanager.js',
      '<%= dirs.engine %>/managers/groupmanager.js',
      '<%= dirs.engine %>/managers/systemmanager.js',
      '<%= dirs.engine %>/managers/tagmanager.js',
      '<%= dirs.engine %>/display/textures.js',
      '<%= dirs.engine %>/display/rendering.js',
      '<%= dirs.engine %>/display/buffer.js',
    ],
    game: [
      '<%= dirs.game %>/astar.js',
      '<%= dirs.game %>/dungeon.js',
      '<%= dirs.game %>/tilemap.js',
      '<%= dirs.game %>/main.js',
      '<%= dirs.game %>/components.js',
      '<%= dirs.game %>/creator.js',
      '<%= dirs.game %>/systems/camera.js',
      '<%= dirs.game %>/systems/dungeon-collision.js',
      '<%= dirs.game %>/systems/keyboard-control.js',
      '<%= dirs.game %>/systems/lifetime-control.js',
      '<%= dirs.game %>/systems/movement.js',
      '<%= dirs.game %>/systems/path-follow.js',
      '<%= dirs.game %>/systems/sprite-direction.js',
      '<%= dirs.game %>/systems/sprite-renderer.js',
      '<%= dirs.game %>/screens/game.js',
    ],
  };

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    dirs: {
      build: 'dist',
      engine: 'src/engine',
      game: 'src/game',
    },
    clean: {
      build: ['dist/'],
    },
    jshint: {
      options: {
        '-W030': true,
        '-W082': true,
        '-W084': true,
        '-W086': true,
        '-W088': true,
        '-W018': true,
        '-W120': true,
      },
      files: ['Gruntfile.js', 'src/**/*.js'],
    },
    watch: {
      files: ['<%= jshint.files %>'],
      tasks: ['dev'],
    },
    compress: {
      dist: {
        options: {
          archive: 'dist/pixelwars.zip',
          mode: 'zip',
          level: 9,
        },
        files: [
          {expand: true, cwd: 'dist/', src: ['p.js', 'index.html']},
          {expand: true, flatten: true, src: ['assets/*.png']},
        ],
      },
    },
    concat: {
      dist: {
        options: {
          // Globals must be adjusted before packaging the final version.
          // Dropping some of them produce a bigger JavaScript file but
          // smaller ZIP archive. RLY? WTF!
          banner: "!function(window, document, Object, Math) {\n",
          footer: "\nrunGame();\n} (window, document, Object, Math)\n",
        },
        files: {
          'dist/pixelwars.js': [files.engine, files.game],
        },
      },
    },
    constants: {
      dev: {
        options: {
          namespace: '__PW_',
        },
        files: {
          'dist/constants.js': ['src/constants.json', 'src/constants.dev.json'],
        },
      },
    },
    uglify: {
      dist: {
        options: {
          report: 'min',
          compress: {
            global_defs: processedConstants,
          },
        },
        files: {
          'dist/p.js': ['dist/pixelwars.js'],
        },
      },
    },
    htmlmin: {
      dist: {
        options: {
          collapseWhitespace: true,
          removeComments: true,
        },
        files: {
          'dist/index.html': 'src/index.html',
        },
      },
    },
  });

  grunt.registerTask('dev', ['jshint', 'constants']);
  grunt.registerTask('package', ['concat', 'uglify', 'htmlmin', 'compress']);

  grunt.registerTask('default', ['clean', 'dev', 'package']);

};
