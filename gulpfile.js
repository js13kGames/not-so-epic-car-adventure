var gulp = require('gulp');
var concat = require('gulp-concat');
var wrap = require('gulp-wrap');

gulp.task('build', function() {
  gulp.src('./src/js/*.js')
    .pipe(concat('build.js'))
    .pipe(wrap('(function(){\n<%= contents %>\n})();'))
    .pipe(gulp.dest("./dist"));

  return gulp.src('./src/lib/*.js')
    .pipe(gulp.dest('./dist'))

});

gulp.task('static', function(){
  gulp.src('./src/page/index.html')
      .pipe(gulp.dest('./dist'));
})

gulp.task('default', ['build','static'])