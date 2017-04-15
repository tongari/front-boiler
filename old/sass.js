var sass = require('node-sass');
sass.render({
  file: './src/css/style.scss',
  [
    outFile: './dist/css/style.css'
  ]
}, function(err, result) { /*...*/ });

var result = sass.renderSync({
 file: './src/css/style.scss',
 outputStyle: 'compressed',
 outFile: './dist/css/style.css',
 sourceMap: false,
 importer: function(url, prev, done) {
 someAsyncFunction(url, prev, function(result){
 done({
 file: result.path, // only one of them is required, see section Sepcial Behaviours.
 contents: result.data
 });
 });
