var gulp = require('gulp'),
  addsrc = require('gulp-add-src'),
  gutil = require('gulp-util'),
  sass = require('gulp-sass'),
  rename = require("gulp-rename"),
  inject = require('gulp-inject'),
  sourcemaps = require('gulp-sourcemaps'),
  del = require('del'),
  path = require('path'),
  concat = require('gulp-concat'),
  minify = require('gulp-minify'),
  prettify = require('gulp-jsbeautifier'),
  jsValidate = require('gulp-jsvalidate'),
  mainBowerFiles = require('gulp-main-bower-files'),
  gulpFilter = require('gulp-filter'),
  exec = require('child_process').exec;

/*
WIll spawn a watcher which auto-formats JS, SCSS and HTML,
and recreate the minified JS or CSS and their respective mappings according to file type changed
*/
gulp.task('default', ['minify-js:debug', 'fixscssstyle', 'fixhtmlstyle', 'inject-dependencies:debug'],
  function() {
    gutil.log('Spawning simple HTTP dev-server...');

    exec('node node_modules/http-server/bin/http-server ./src -o', function(err, stdout, stderr) {
      console.log(stdout);
      console.log(stderr);
    });

    gutil.log('Done. Watching source-code for changes...');

    gulp.watch([
      'src/js/**/*.js', './*.js*', './.*rc',
      'src/scss/**/*.scss',
      'src/partials/**/*.html',
      'src/*.html', "!src/index.html",
      '!src/*.min.*'
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

      // if path in src/
      switch (extension) {
        case 'scss':
          gutil.log('detected SCSS change, rebuilding CSS.');
          minifyScss(true);
          break;

        case 'js':
          gutil.log('detected JS change, rebuilind JS.');
          minifyJs(true)
          break
      }

      return stream;
    });
  });


/*
Formats SCSS files
*/
gulp.task('fixscssstyle', function() {
  gutil.log('Formatting SCSS source-code...');

  return gulp.src('src/scss/**/*.scss')
    .pipe(prettify({
      config: '.jsbeautifyrc',
      mode: 'VERIFY_AND_WRITE'
    }))
    .pipe(gulp.dest('src/scss'));
});

/*
Formats JS files
*/
gulp.task('fixjsstyle', ['lint-js'], function() {
  return gulp.src('src/js/**/*.js')
    .pipe(prettify({
      config: '.jsbeautifyrc',
      mode: 'VERIFY_AND_WRITE'
    }))
    .pipe(gulp.dest('src/js'));
});

/*
Minifies JS and create source mappings
*/
var minifyJs = function(debug) {
  if (debug === undefined) {
    debug = false
  }

  gutil.log('Generating JS, debug: ' + debug);

  var filterJS = gulpFilter('**/*.js', {
    restore: true
  });
  var srcLocation = debug ? 'src/js/**/*.js' : 'dist/js/**/*.js';

  // TODO: include dependencies JS using bower main files.
  return gulp.src('./bower.json')
    .pipe(mainBowerFiles())
    .pipe(filterJS)
    .pipe(addsrc(srcLocation))
    .pipe(sourcemaps.init())
    .pipe(concat('App.js'))
    .pipe(minify({
      mangle: false
    }))
    .pipe(rename('App.min.js'))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(debug ? './src' : './dist'));
}

/*
Minifies JS in /src folder
*/
gulp.task('minify-js:debug', ['fixjsstyle'], function() {
  return minifyJs(true);
});

/*
Lints JavaScript source code. Helps finding obscure errors.
*/
gulp.task('lint-js', function() {
  return gulp.src('src/js/**/*.js')
    .pipe(jsValidate());
});

/*
Automatically injects JS and CSS into HTML
*/
var injectDependencies = function(debug) {
  if (debug === undefined) {
    debug = false
  }

  gutil.log('Injecting dependencies into index.html, debug: ' + debug);

  var target = gulp.src((debug ? 'src/' : 'dist/') + 'index.src.html');
  var sources = null;

  if (debug) {
    sources = gulp.src(['src/App.min.js', 'src/styles.min.css']);
  } else {
    sources = gulp.src(['dist/App.min.js', 'dist/styles.min.css']);
  }

  return target.pipe(rename('index.html'))
    .pipe(inject(sources, { // sources.pipe(angularFilesort())  TODO: <- must fix problem with modules within closures first
      relative: true
    }))
    .pipe(gulp.dest(debug ? './src' : './dist'));
}

gulp.task('inject-dependencies:debug', ['minify-css:debug'], function() {
  return injectDependencies(true);
})

/*
Minifies SCSS  into CSS and create source mappings
*/
var minifyScss = function(debug) {
  if (debug === undefined) {
    debug = false
  }

  gutil.log('Generating CSS, debug: ' + debug);

  // TODO get SCSSs from bower main files
  var filterCSS = gulpFilter('**/*.scss', {
    restore: true
  });
  var srcLocation = debug ? 'src/scss/**/*.scss' : 'dist/scss/**/*.scss';

  return gulp.src('./bower.json')
    .pipe(mainBowerFiles({
      overrides: {
        "angular-material": {
          "main": [
            "angular-material.scss"
          ]
        }
      }
    }))
    .pipe(filterCSS)
    .pipe(addsrc(srcLocation))
    .pipe(sourcemaps.init())
    .pipe(concat('styles.scss'))
    .pipe(sass({
      style: (debug ? 'expanded' : 'compressed')
    }).on('error', sass.logError))
    .pipe(rename('styles.min.css'))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(debug ? './src' : './dist'));
}

gulp.task('minify-css:debug', function() {
  return minifyScss(true);
});

gulp.task('minify-css', function() {
  return minifyScss();
});

gulp.task('fixhtmlstyle', function() {
  gutil.log('Formatting HTML source-code...');

  return gulp.src('src/partials/**/*.html')
    .pipe(prettify({
      config: '.jsbeautifyrc',
      mode: 'VERIFY_AND_WRITE'
    }))
    .pipe(gulp.dest('src/partials'));
});

/** build tasks **/

gulp.task('clean-last-build', function() {
  return del(['dist/**/*.*']);
});

gulp.task('prepare-deploy', ['clean-last-build'], function() {
  return gulp.src('src/**/*.*').pipe(gulp.dest('dist/'));
});


gulp.task('minify-css', ['prepare-deploy'], function() {
  return minifyScss(false);
});

gulp.task('minify-js', ['minify-css'], function() {
  return minifyJs(false);
});

gulp.task('inject-dependencies', ['minify-js'], function() {
  return injectDependencies(false);
})

gulp.task('clean', ['inject-dependencies'], function() {
  return del([
    'dist/bower_components',
    'dist/*.map',
    'dist/index.src.html',
    'dist/scss',
    'dist/js',
    'dist/dguard.js'
  ]);
});

gulp.task('deploy', ['clean'], function() {
  gutil.log('Deployed files to "./dist".');
});
