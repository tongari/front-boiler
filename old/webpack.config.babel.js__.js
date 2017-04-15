import webpack from 'webpack';
import WebpackBuildNotifierPlugin from 'webpack-build-notifier';
import WebpackStrip from 'strip-loader';
import path from 'path';
import colors from 'colors';


/**
 * option
 */
colors.setTheme({
  custom: ['green', 'bold']
});

const PATH = {
  src: './src',
  dist: './dist'
};


/**
 * js compile
 */
const jsConfig = ((env)=> {
  const entry = {
    'app': [
      `${PATH.src}/js/app.js`
    ]
  };
  const output = {
    path: path.resolve(__dirname, `${PATH.dist}/js`),
    filename: "[name].js"
  };
  const module = ((env)=> {

    const jsModule = {
      test: /\.jsx?$/,
      exclude: /(node_modules)|(\.DS_Store$)/,
      loaders: ['babel-loader','eslint-loader']
    };

    if(env === 'prod'){
      console.log('      ******************************************************************'.green);
      console.log('                      deploy start!!  '.custom);
      console.log('                      remove console.log  '.custom);
      console.log('      ******************************************************************'.green);
      jsModule.loaders.unshift(
        WebpackStrip.loader('console.log')
      );
    };

    return {
      rules: [jsModule]
    };
  })(env);

  const eslint = {
    configFile: '.eslintrc'
  };

  const plugins = [];

  if(env === 'prod'){
    plugins.unshift(
      new webpack.DefinePlugin({ 'process.env': { 'NODE_ENV': '"production"' } }),
      new webpack.optimize.UglifyJsPlugin({ compress: { warnings: false } })
    );
  } else {
    plugins.unshift(
      new WebpackBuildNotifierPlugin()
    );
  }

  return {entry, output, module, plugins}
})(process.env.NODE_ENV);

module.exports = [jsConfig];
