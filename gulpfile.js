var gulp = require('gulp'),
  gutil = require('gulp-util'),
  sass = require('gulp-sass'),
  rename = require("gulp-rename"),
  del = require('del'),
  path = require('path'),
  concat = require('gulp-concat'),
  minify = require('gulp-minify'),
  prettify = require('gulp-jsbeautifier')
  jsValidate = require('gulp-jsvalidate'),
  exec = require('child_process').exec;

  gulp.task('default', ['fixjsstyle', 'fixscssstyle', 'fixhtmlstyle', 'inject-dependencies:debug'],
    function() {
      gutil.log('Watching source-code for changes...');

      gulp.watch([
        'src/' + project.jsSrcFolder + '/**/*.js', './*.js*', './.*rc',
        'src/' + project.scssSrcFolder + '/**/*.scss',
        'src/' + project.partialsSrcFolder + '/**/*.html',
        'src/*.html', "!src/index.html", "!src/bower_components/**/*.*", "!node_modules/**/*.*"
      ], function(event) {
        var epath = event.path.substring(0, event.path.lastIndexOf(path.sep)),
          filename = event.path.substring(event.path.lastIndexOf(path.sep) + 1, event.path.length),
          extension = filename.substring(filename.lastIndexOf('.') + 1, filename.length),
          stream = gulp.src(event.path);

        if (event.type !== 'deleted') {
          stream = stream.pipe(prettify({
              config: '.jsbeautifyrc',
              mode: 'VERIFY_AND_WRITE'
            }))
            .pipe(gulp.dest(epath));
        }

        switch (extension) {
          case 'scss':
            minifyScss(true);
            break;

          case 'js':
            if (event.path.lastIndexOf(project.jsSrcFolder) !== -1) {
              injectDependencies()
              break;
            }
        }

        return stream;
      });
  });

gulp.task('runserver', ['minify-js'], function (cb) {
 exec('node node_modules/http-server/bin/http-server -o', function (err, stdout, stderr) {
   console.log(stdout);
   console.log(stderr);
   cb(err);
 });
});

gulp.task('deploy', ['minify-js'], function() {

});

gulp.task('fixjsstyle', ['lint-js'], function() {
  gutil.log('Formatting JavaScript source-code...');

  return gulp.src('scripts/**/*.js')
    .pipe(prettify({
      config: '.jsbeautifyrc',
      mode: 'VERIFY_AND_WRITE'
    }))
    .pipe(gulp.dest('scripts'));
});

gulp.task('minify-js', ['fixjsstyle'], function() {
  return gulp.src('scripts/**/*.js')
  .pipe(concat('App.js'))
  .pipe(minify({
    mangle: false
  }))
  .pipe(rename('App.min.js'))
  .pipe(gulp.dest('.'));
});

gulp.task('lint-js', function() {
  return gulp.src('scripts/**/*.js')
		.pipe(jsValidate());
});


var injectDependencies = function(debug) {
  if (debug === undefined) {
    debug = false
  }

  gutil.log('Injecting dependencies into index.html, debug: ' + debug);

  var target = gulp.src((debug ? 'src/' : 'dist/') + 'index.src.html');
  var sources = null;

  if (debug) {
    sources = gulp.src(project.jsLibs.map(function(lib) {
      return 'src/' + lib;
    }).concat('src/' + project.jsSrcFolder + '/**/*.js').concat('src/styles.min.css'));
  } else {
    sources = gulp.src(['dist/dguard-min.js', 'dist/styles.min.css']);
    // sources = gulp.src(project.jsLibs.map(function(lib) {
    //   return 'dist/' + lib;
    // }).concat('dist/' + project.jsSrcFolder + '/**/*.js').concat('dist/styles.min.css'));
  }

  return target.pipe(rename('index.html'))
    .pipe(inject(sources, { // sources.pipe(angularFilesort())  TODO: <- must fix problem with modules within closures first
      relative: true
    }))
    .pipe(gulp.dest(debug ? 'src/' : 'dist/'));
}

gulp.task('inject-dependencies:debug', ['minify-css:debug'], function() {
  return injectDependencies(true);
})
