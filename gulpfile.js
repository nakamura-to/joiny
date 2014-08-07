var gulp = require('gulp');
var tsc = require('gulp-tsc');
var _ = require('lodash');
var karma = require('karma').server;

var karmaCommonConf = {
    browsers: ['Chrome'],
    frameworks: ['jasmine'],
    files: [
        'src/**/*.js',
        'test/**/*.spec.js'
    ]
};

gulp.task('test', function (done) {
    karma.start(_.assign({}, karmaCommonConf, {singleRun: true}), done);
});

gulp.task('tdd', function (done) {
    karma.start(karmaCommonConf, done);
});

gulp.task("compile", function() {
    gulp.src(["src/**.ts"])
        .pipe(tsc({
            out: 'join.js',
            target: 'es5',
            sourcemap: false,
            noImplicitAny: true
        }))
        .pipe(gulp.dest("dist/"));
});

gulp.task('default', ['compile']);