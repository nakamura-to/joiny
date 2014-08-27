module.exports = function(config) {
    config.set({
        browsers: ['Chrome'],
        frameworks: ['jasmine'],
        files: [
            'dist/**/*.js',
            'test/**/*.spec.js'
        ]
    });
};
