'use strict';

const _ = require('lodash');
const pathInner = require('path');
const rename = require('gulp-rename');
// const watch = require('gulp-watch');
// const chalk = require('chalk');
// const sourcemaps = require('gulp-sourcemaps');
// const uglify = require('gulp-uglify');
// const babel = require('gulp-babel');
//
// const browserify = require('browserify');
// const source     = require('vinyl-source-stream');

const helpers = require('./helpers');
// const rejector = helpers.rejector;
// const logger = helpers.logger;

module.exports = function dependenciesJs(gulp, conf) {
  const tasks = [];

  function cpHandler(config, file, dest) {
    return new Promise((resolve, reject) => {
      let destination;
      let renameTo;
      if (!dest.trim()) {
        destination = config.DEST_PATH;
      } else if (dest.lastIndexOf('/') !== dest.length - 1) {
        renameTo = pathInner.basename(dest);
        destination = pathInner.join(config.DEST_PATH, pathInner.dirname(dest));
      } else {
        destination = pathInner.join(config.DEST_PATH, dest);
      }

      let pipe = gulp.src(file)
        .pipe(helpers.logger('cp'));
      if (renameTo) {
        pipe = pipe.pipe(rename((f) => (f.basename = renameTo)));
      }
      pipe = pipe.pipe(gulp.dest(destination))
        .on('error', reject)
        .on('end', resolve);
      return pipe;
    });
  }

  tasks.push([
    'dependencies:cp:build',
    [],
    function cpBuild() {
      return Promise.all(_.map(conf.files, (dest, file) => cpHandler(conf, file, dest)));
    },
  ]);

  return tasks;
};
