
/*
// require
*/

// gulp
var gulp = require('gulp');

var path = require('path');

var eslint = require('gulp-eslint');

// remove files
var del = require('del');

var rename = require('gulp-rename');

// run npm script
var exec = require('child_process').exec;

// use if sentence
var gulpif = require("gulp-if"); // use if on gulp

var plumber = require('gulp-plumber'); // avoid error

// // postcss
var postcss = require('gulp-postcss');
var cssnano = require('cssnano');
var autoprefixer = require('autoprefixer');

// webserver
var webserver = require('gulp-webserver');

// // webpack
var webpack = require('webpack');
var webpackStream = require('webpack-stream');

// allow to use external gulp config file
var gulpConfig = require('./gulp.config.js');

// static page generator
var metalsmith = require('gulp-metalsmith');
var metalsmithLayout = require('metalsmith-layouts'); // use option
var metalsmithInplace = require('metalsmith-in-place'); // use partial & yaml front matter

var runSequence = require('run-sequence');


/*
/  each tasks
*/

// remove files
gulp.task('clean', function () {
  del('./dist/**');
});

// static page generator
gulp.task('metalsmith', function () {
  return gulp.src('src/html/page/**/*.html')
    .pipe(metalsmith({

      // // Metalsmith's root directory, for example for locating templates, defaults to CWD
      // root: __dirname,
      // // Files to exclude from the build
      // ignore: ['src/*.tmp'],
      // // Initial Metalsmith metadata, defaults to {}
      // metadata: {
      //   site_title: 'Sample static site'
      // },
      // // List of JSON files that contain page definitions
      // // true means "all JSON files", see the section below
      // json: ['src/pages.json']

      frontmatter: true,
      use: [
        metalsmithLayout({
          engine: 'handlebars',
          "directory": "./src/html/layout",
          "partials": "./src/html/partial",
          "default": "default.html",
        // }),
        // metalsmithPartial({
        //   'directory': './src/html/partial'
        // }),
        // metalsmithTemplates({
        //   'engine': 'eco',
        //   'inPlace': true
        }),
        metalsmithInplace({
          "engine": "handlebars"
        })
      ]
    }))
    .pipe(gulp.dest('./dist'));
});

// eslint
gulp.task('lint', function () {
    // ESLint ignores files with "node_modules" paths.
    // So, it's best to have gulp ignore the directory as well.
    // Also, Be sure to return the stream from the task;
    // Otherwise, the task may end before the stream has finished.
    return gulp.src(['**/*.js','!node_modules/**'])
        // eslint() attaches the lint output to the "eslint" property
        // of the file object so it can be used by other modules.
        .pipe(eslint())
        // eslint.format() outputs the lint results to the console.
        // Alternatively use eslint.formatEach() (see Docs).
        .pipe(eslint.format())
        // To have the process exit with an error code (1) on
        // lint error, return the stream and pipe to failAfterError last.
        .pipe(eslint.failAfterError());
});

// css
gulp.task('css', function () {
  var processors = [
    require('precss')({ 'import': { extension: 'scss' } }),
    autoprefixer({
      browsers: ['ie >= 9', 'ios_saf >= 7', 'Android >= 4.1', 'ChromeAndroid >= 50', 'last 2 versions']
    }),
    cssnano()
  ];
  return gulp.src(['./src/css/*.scss', './src/css/page/*.scss'])
    .pipe(postcss(processors))
    .pipe(rename(function (path) {
      path.extname = ".css"
    }))
    .pipe(gulp.dest('./dist/css/'));
});

// webpack
gulp.task('webpack', function () {
  gulp.src([])
    .pipe(plumber()) // avoid error
    .pipe(webpackStream({
      context: path.resolve(__dirname, 'src/js'),
      entry: {
        subscribe: './subscribe.bundle.js',
        confirm: './confirm.bundle.js',
        [ 'ie9-support' ]: './ie9-support.bundle.js',
        vendor: [ 'eventemitter2', 'jquery', 'bootstrap', 'babel-polyfill' ]
      },
      output: {
        filename: '[name].bundle.js'
      },
      module: {
        rules: [
          {
            test: /\.js$/,
            exclude: [ /node_modules/ ],
            use: [
              {
                loader: 'babel-loader',
                options: {
                  presets: ['es2015']
                }
              }
            ]
          }
        ]
      },
      resolve: {
        alias: {
          Root: path.resolve(__dirname + '/src/js/')
        },
      },
      devtool: 'source-map',
      plugins: [
        new webpack.ProvidePlugin({
          $: 'jquery',
          jQuery: 'jquery',
          jquery: 'jquery',
          "window.jQuery": "jquery",
          "window.Tether": 'tether'
        }),
        new webpack.optimize.CommonsChunkPlugin({
          names: [ 'vendor' ]
        }),
        new webpack.optimize.UglifyJsPlugin({
          sourceMap: true
        })
      ],
      externals: {
        $: 'jquery'
      }
    }, webpack))
    .pipe(gulp.dest('./dist/js')); // build
});

// connect
gulp.task('connect', function() {
  connect.server({
    root: [__dirname]
  });
});

// webserver
gulp.task('webserver', function() { // dist を監視して変更があったら reload
  gulp.src('./dist')
    .pipe(webserver({
      livereload: true,
      host: 'localhost',
      port: 8000,
      fallback: 'index.html',
      open: true
    }));
});

// watch
gulp.task('watch', function() { // src を監視
  gulp.watch('./src/js/**/*.js', ['webpack']);
  gulp.watch('./src/css/**/*.scss', ['css']);
  gulp.watch('./src/**/*.html', ['metalsmith']);
});


/*
/ declare multiple tasks
*/

gulp.task('default', function(callback) {
  return runSequence(
    'clean',
    ['css', 'metalsmith', 'webpack'],
    ['webserver', 'watch'],
    callback
  );
});

gulp.task('build:release', function(callback) {
  return runSequence(
    'clean',
    ['css', 'metalsmith', 'webpack'],
    callback
  );
});
// gulp.task('default', ['webpack', 'watch', 'webserver', 'lint']);
