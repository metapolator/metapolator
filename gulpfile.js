var gulp = require('gulp'),
    gutil = require('gulp-util'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    size = require('gulp-size'),
    minifycss = require('gulp-minify-css'),
    rename = require('gulp-rename'),
    debug = require('gulp-debug');

var gulpBowerFiles = require('gulp-bower-files');

var filePath = {
    appjsminify: { src: 'static/js/*.js', dest: './static/dist' },
    libsjsminify: { src: ['static/lib/**/*.js',
                        'static/js/3rdparty/*.js',
                        'static/js/3rdparty/**.min.js'],
                        dest: './static/dist/lib/' },
    minifycss: { src: ['./static/css/*.css', './static/lib/**/*.css',
                        './static/lib/**/*.min.css'],
                dest: './static/dist/css/' }
};

gulp.task('build', function () {
    gulpBowerFiles().pipe(gulp.dest("./static/lib"));
    gulp.src(filePath.appjsminify.src)
        .pipe(debug())
        // .pipe(uglify())
        .pipe(concat('app.js'))
        .pipe(size())
        .pipe(gulp.dest(filePath.appjsminify.dest));
    gulp.src(filePath.libsjsminify.src)
        .pipe(debug())
        .pipe(uglify())
        .pipe(concat('libs.js'))
        .pipe(size())
        .pipe(gulp.dest(filePath.libsjsminify.dest));
    gulp.src(filePath.minifycss.src)
        .pipe(debug())
        .pipe(minifycss())
        .pipe(rename({ suffix: '.min' }))
        .pipe(concat('app.css'))
        .pipe(size())
        .pipe(gulp.dest(filePath.minifycss.dest));
});
