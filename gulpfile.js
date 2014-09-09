var gulp = require('gulp')
 , replace = require('gulp-replace')
 , insert = require('gulp-insert')
 , requireConvert = require("gulp-require-convert")
 , npmConvert, module, i=0
 ;

/**
 * Convert some npm-modules to require-js modules.
 * Let's hope this is enough for all our conversion needs, because
 * I strongly prefer to have it happen completely automatically.
 */
npmConvert = [
    'gonzales/lib'
    ,'immutable-complex/lib'
    ,'commander'
];
for(; i<npmConvert.length;i++) {
    module = npmConvert[i];
    gulp.src('./node_modules/' + module +'/*.js')
        // remove the ".js" at the end of the module name.
        //      from: require('./modulename.js')
        //      to:   require('./modulename')
        // requireJS handles a module ending with .js like an url and
        // doesn't find the modules to load anymore. This was done for
        // the gonzales css parser
        .pipe(replace(/(require\(['|"])(.+)(\.js)(['|"]\))/g, function() {
            // see: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace#Specifying_a_function_as_a_parameter
            var val = Array.prototype.slice.call(arguments, 1, -2);
            val.splice(2,1);// this removes the 3rd match, here '.js'
            return val.join('');
        }))
        .pipe(requireConvert())
        .pipe(insert.prepend('/*\n\
 * Don\'t edit this file by hand!\n\
 * This file was generated from a npm-package using gulp. \n\
 * For more information see gulpfile.js in the project root\n\
 */\n'))
        .pipe(gulp.dest('./app/lib/npm_converted/' + module));
}
