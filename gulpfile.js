var gulp = require('gulp'),
    gutil = require('gulp-util'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat-sourcemap'),
    size = require('gulp-size'),
    minifycss = require('gulp-minify-css'),
    rename = require('gulp-rename'),
    debug = require('gulp-debug')
    watch = require('gulp-watch');

var mapOptions = {
    sourcesContent: true,
}

var filePath = {
    appjsminify: { src: ['static/js/*.js','static/js/3rdparty/*.js',
    'static/js/3rdparty/**.min.js'], dest: './static/dist' },
    libsjsminify: { src: ['static/js/lib/jquery.min.js',
                        'static/js/lib/bootstrap.min.js'],
                        dest: './static/dist/' },
    minifycss: { src: ['./static/css/*.css',
                        ],
                dest: './static/dist/css/' }
};

gulp.task('build', function () {
    gulp.src(filePath.appjsminify.src)
        .pipe(debug())
        .pipe(uglify())
        .pipe(concat('app.js', mapOptions))
        .pipe(size())
        .pipe(gulp.dest(filePath.appjsminify.dest));
    gulp.src(filePath.libsjsminify.src)
        .pipe(debug())
        .pipe(uglify())
        .pipe(concat('libs.js', mapOptions))
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

gulp.task('watch', function () {
    gulp.src(filePath.appjsminify.src)
        .pipe(watch(function(files) {
            return files.pipe(uglify())
                        .pipe(concat('libs.js', mapOptions))
                        .pipe(size())
                        .pipe(gulp.dest(filePath.appjsminify.dest));
        }));
});
