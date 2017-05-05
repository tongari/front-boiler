import gulp from 'gulp';
import plumber from 'gulp-plumber';
import gulpif from 'gulp-if';
import notify from 'gulp-notify';
import del from 'del';
import path from 'path';
import glob from 'glob';
import browserSync from 'browser-sync';
import sourcemaps from'gulp-sourcemaps';
import runSequence from 'run-sequence';

import metalsmith from 'gulp-metalsmith';
import metalsmithLayout from 'metalsmith-layouts';

import sass from 'gulp-sass';
import spritesmith from 'gulp.spritesmith';
import cssnano from 'gulp-cssnano';
import aigis from 'gulp-aigis';

import webpack from 'webpack';
import webpackStream from 'webpack-stream';
import eslint from 'gulp-eslint';

const PATH = {
  src: './src',
  html: './src/html/**/*.html',
  css: './src/css/**/*.scss',
  js: './src/js/**/**.js',
  sprite: './src/assets/**/sprite',
  dist: './dist'
};

const isDev = () => (process.env.NODE_ENV === 'dev');

const sucessNotifier = () => (
  notify({
    title: 'build sucess!!',
    sound: 'Submarine',
    icon: path.join(__dirname, '/system/notifier/ok.png')
  })
);

const failNotifier = () => (
  notify.onError({
    title: 'build failed!!',
    icon: path.join(__dirname, '/system/notifier/ng.png'),
    sound: 'Submarine',
    messsage: "Error: <%= error.message %>",
  })
);

const esLintWarning = () => {
  return notify({
    title: 'eslint Warning!!',
    sound: 'Submarine',
    icon: path.join(__dirname, '/system/notifier/caution.png')
  })
};

//clean
gulp.task('clean', ()=>{
  del(`${PATH.dist}/**`);
});


//html
gulp.task('html', () => {
  return gulp.src('src/html/page/**/*.html')
    .pipe(plumber({
      errorHandler: failNotifier()
    }))
    .pipe(metalsmith({
      root: './src/html/',
      frontmatter: true,
      use: [
        metalsmithLayout({
          engine: 'handlebars',
          "directory": "layout",
          "partials": "partial",
          "default": "default.html"
        })
      ]
    }))
    .pipe(gulp.dest('./dist'))
    .pipe(gulpif(isDev(),browserSync.stream()));
});


//css
gulp.task('css', () => {
  return gulp.src([PATH.css,`!${PATH.css}/**/_sprite.scss`])
  .pipe(plumber({
    errorHandler: failNotifier()
  }))
  .pipe(gulpif(isDev(), sourcemaps.init()))
  .pipe(sass())
  .pipe(cssnano({
    autoprefixer: {browsers: ['ie >= 11', 'Android >= 4.1', 'last 2 versions'], add: true}
  }))
  .pipe(gulpif(isDev(), sourcemaps.write('.')))
  .pipe(gulp.dest(`${PATH.dist}/css`))
  .pipe(gulpif(isDev(), gulp.dest(`${PATH.dist}/styleguide/css`)))
  .pipe(gulpif(isDev(), browserSync.stream()))
  // .pipe(sucessNotifier());
});

//server
gulp.task('server', () => {
  return browserSync.init({
    server: {
      baseDir: PATH.dist
    },
    port: 9000,
    ghostMode:{
      scroll: false
    }
  })
})

// js
gulp.task('js', () => {

  return gulp.src([])
    .pipe(plumber({
      errorHandler: failNotifier()
    }))
    .pipe(webpackStream({
      context: path.resolve(__dirname, 'src/js'),
      entry: {
        app: './app.js',
        main: './main.js',
      },
      output: {
        filename: '[name].js'
      },
      // watch: isDev(),
      module: {
        rules: [
          {
            test: /\.js$/,
            exclude: [ /node_modules/ ],
            use: [
              { loader: 'babel-loader' },
            ]
          }
        ]
      },
      resolve: {
        alias: {
          Root: path.resolve(__dirname + '/src/js/'),
          'vue$': 'vue/dist/vue.esm.js'
        },
      },
      // cache: true,
      devtool: 'source-map',
      plugins: [
        new webpack.optimize.UglifyJsPlugin({
          sourceMap: isDev()
        })
      ]
    }, webpack))
    .pipe(gulp.dest(`${PATH.dist}/js`))
    .pipe(gulpif(isDev(),browserSync.stream()))
    // .pipe(sucessNotifier());
});

// eslint
let isWarning = false;
gulp.task('eslint', () => {
  return gulp.src(PATH.js)
    .pipe(plumber({
      errorHandler: failNotifier()
    }))
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError())
    // .pipe(eslint.result( (result) => {
    //   if(result.warningCount !== 0) {
    //     isWarning = true;
    //   } else {
    //     isWarning = false;
    //   }
    // }))
    // .pipe( gulpif(!isDev() ,gulpif(isWarning, esLintWarning())) )
});

//sprite
gulp.task('sprite', () => {
  return glob(PATH.sprite, (err, files) => {
    files.map( (entry) => {
      const spritePath = `${entry}/*.{png,jpg,gif}`;
      const imgName = entry.replace('./src/assets/','').replace('sprite','sprite.png');
      const cssName = entry.replace('/sprite','/_sprite.scss').replace('./src/assets','css/shared/sprite');
      const imgPath = `${entry.replace('./src/assets','/sprite')}.png?${Date.now()}`;
      const spriteStream = gulp.src(spritePath).pipe(plumber()).pipe(spritesmith({
        imgName: imgName,
        cssName: cssName,
        imgPath: imgPath,
        algorithm: 'binary-tree',
        cssFormat: 'scss',
        padding: 4
      }));
      spriteStream.img.pipe(gulp.dest(`${PATH.src}/sprite`));
      spriteStream.css.pipe(gulp.dest(PATH.src));
    });
  });
});

//copy
gulp.task('copy', () => {
  return gulp.src(`${PATH.src}/sprite/**`)
    .pipe(gulp.dest(`${PATH.dist}/sprite`))
});

gulp.task("styleguide", () => {
  gulp.src("./aigis_config.yml")
    .pipe(aigis());
});


// dev
gulp.task('dev',['server', 'styleguide', 'copy', 'html', 'css', 'eslint', 'js'], () => {
  gulp.watch(PATH.html, ['html']);
  gulp.watch(PATH.css, ['css', 'styleguide']);
  gulp.watch([PATH.js], ['eslint', 'js']);
});

// prod
gulp.task('prod', ( callback ) => {
  return runSequence(
    'clean',
    'copy',
    'eslint',
    ['html', 'js', 'css'],
    callback
  );
});
