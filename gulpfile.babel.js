import gulp from 'gulp';
import plumber from 'gulp-plumber';
import sass from 'gulp-sass';
import eslint from 'gulp-eslint';
import gulpif from 'gulp-if';
import notify from 'gulp-notify';
import cssnano from 'gulp-cssnano';
import spritesmith from 'gulp.spritesmith';

import webpack from 'webpack';
import webpackStream from 'webpack-stream';
import browserSync from 'browser-sync';

import del from 'del';
import path from 'path';
import glob from 'glob';

import sourcemaps from'gulp-sourcemaps';


const PATH = {
  src: './src',
  html: './src/html/**/*.html',
  css: './src/css/**/*.scss',
  js: './src/js/**/**.js',
  sprite: './src/assets/**/sprite',
  dist: './dist'
};


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

const esLintWarning = () => (
  notify({
    title: 'eslint Warning!!',
    sound: 'Submarine',
    icon: path.join(__dirname, '/system/notifier/caution.png')
  })
);


//clean
gulp.task('clean', () => {
  del(`${PATH.dist}/**`);
});

//html
gulp.task('html', () => {
  return gulp.src(PATH.html)
    .pipe(plumber({
      errorHandler: failNotifier()
    }))
    .pipe(gulp.dest(PATH.dist))
    .pipe(browserSync.stream())
    // .pipe(sucessNotifier());
});

//css
gulp.task('css', () => {
  return gulp.src([PATH.css,`!${PATH.css}/**/_sprite.scss`])
  .pipe(plumber({
    errorHandler: failNotifier()
  }))
  .pipe(sourcemaps.init())
  .pipe(sass())
  .pipe(cssnano({
    autoprefixer: {browsers: ['ie >= 9', 'Android >= 4.1', 'last 2 versions'], add: true}
  }))
  .pipe(sourcemaps.write('.'))
  .pipe(gulp.dest(`${PATH.dist}/css`))
  .pipe(browserSync.stream())
  // .pipe(sucessNotifier());
});

//server
gulp.task('server', () => {
  return browserSync.init({
    server: {
      baseDir: PATH.dist
    }
  })
})

// js
gulp.task('js', () => {
  gulp.src([])
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
      watch: true,
      module: {
        rules: [
          {
            test: /\.js$/,
            exclude: [ /node_modules/ ],
            use: [{ loader: 'babel-loader' }]
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
        new webpack.optimize.UglifyJsPlugin({
          sourceMap: true
        })
      ]
    }, webpack))
    .pipe(gulp.dest(`${PATH.dist}/js`))
    .pipe(browserSync.stream())
    // .pipe(sucessNotifier());
});

// eslint
// let isWarning = false;
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
    // .pipe(gulpif(isWarning, esLintWarning()))
});


gulp.task('sprite', () => {
  return glob(PATH.sprite, (err, files) => {
    files.map( (entry) => {
      const spritePath = `${entry}/*.{png,jpg,gif}`;
      const imgName = entry.replace('./src/assets/','').replace('sprite','sprite.png');
      const cssName = entry.replace('./src/assets','css').replace('/sprite','/_sprite.scss');
      const imgPath = `${entry.replace('./src/assets','/sprite')}.png`;
      const spriteStream = gulp.src(spritePath).pipe(plumber()).pipe(spritesmith({
        imgName: imgName,
        cssName: cssName,
        imgPath: imgPath,
        algorithm: 'binary-tree',
        cssFormat: 'scss',
        padding: 4
      }));
      spriteStream.img.pipe(gulp.dest(`${PATH.dist}/sprite`));
      spriteStream.css.pipe(gulp.dest(PATH.src));
    });
  });
});


// dev
gulp.task('dev',['server', 'sprite', 'html', 'eslint', 'js', 'css'], () => {

  gulp.watch(PATH.html, ['html']);
  gulp.watch(PATH.css, ['css']);
  gulp.watch([PATH.js], ['eslint']);
});
