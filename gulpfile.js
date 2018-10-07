/* eslint-env: node */

let gulp = require('gulp');
let browsersync = require('browser-sync').create();
let reload = browsersync.reload;
let sass = require('gulp-sass');
let sourcemaps = require('gulp-sourcemaps');
let autoprefixer = require('gulp-autoprefixer');
let minifycss = require('gulp-clean-css');
let rename = require('gulp-rename');
let zip = require('gulp-zip');
let sassGlob = require('gulp-sass-glob');
let csscomb = require('gulp-csscomb');
let plumber = require('gulp-plumber');
let gitignore = require('gulp-gitignore');

// Shared variables
var themeZipPath = '.dist';
var themeZipName = require('./package.json').name + '.zip';

gulp.task('styles', function () {
    //noinspection JSCheckFunctionSignatures
    gulp.src(['sass/main.scss'])
        .pipe(plumber())
        .pipe(sourcemaps.init({largeFile: true}))
        .pipe(rename({
            basename: 'style'
        }))
        .pipe(sassGlob())
        .pipe(sass())
        .pipe(autoprefixer({ grid: true }))
        .pipe(csscomb())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('assets/css/'))
        .pipe(minifycss())
        .pipe(sourcemaps.write())
        .pipe(rename({
            extname: '.min.css'
        }))
        .pipe(gulp.dest('assets/css/'))
        .pipe(reload({stream: true}));
});

gulp.task('serve', ['styles'], function () {
    browsersync.init({
        logPrefix: 'Saga for Ghost',
        port: 3000
    });
    //noinspection JSCheckFunctionSignatures
    gulp.watch('sass/**/*.scss', ['styles']);
    //noinspection JSCheckFunctionSignatures
    gulp.watch(['./*.hbs', './partials/*.hbs']).on('change', reload);
    //noinspection JSCheckFunctionSignatures
    gulp.watch('assets/**/*.js').on('change', reload);
});

gulp.task('default', ['serve']);

/*
 * Deployment tasks
 */

gulp.task('zip', ['styles'], function () {
    // Include all files, except node_modules which are large and make this slow
    return gulp.src(['**', '!node_modules/**'])
    // Now also exclude everything mentioned in gitignore
        .pipe(gitignore())
        // Zip up what is left & save it
        .pipe(zip(themeZipName))
        .pipe(gulp.dest(themeZipPath));
});
