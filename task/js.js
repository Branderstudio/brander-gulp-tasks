'use strict';

const _ = require('lodash');
const pathInner = require('path');
const watch = require('gulp-watch');
const chalk = require('chalk');
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify');
const babel = require('gulp-babel');

const helpers = require('./helpers');
const rejector = helpers.rejector;
const logger = helpers.logger;

module.exports = function dependenciesJs(gulp, conf) {
  const tasks = [];
  (function (handle) {
    helpers.normalizePaths(conf);

    tasks.push([
      'dependencies:js:build',
      ['bower:dependencies'],
      function jsBuild() {
        const result = [];
        _.each(conf.paths, (paths, dest) =>
          _.each(paths, (path) =>
            result.push(handle(conf, path, dest))
          )
        );

        return Promise.all(result);
      },
    ]);

    tasks.push([
      'dependencies:js:watch',
      ['dependencies:js:build'],
      function jsWatch() {
        return helpers.watchAutoHandle(conf, handle, watch);
      },
    ]);
  })(function jsHandle(config, path, dest, base) {
    return new Promise((resolve, reject) => {
      const rejecting = rejector(reject);
      let pipe = gulp.src(path, {base})
        .on('error', rejecting)
        .pipe(sourcemaps.init())
        .pipe(babel())
        .on('error', (error) => {
          console.log(chalk.bgRed.black(`[BABEL] ${error.message}`));
          if (error.codeFrame) {
            console.log(error.codeFrame);
          }
          reject(error);
        });
      if (config.minify) {
        pipe = pipe.pipe(uglify())
          .on('error', rejecting);
      }
      pipe = pipe
        .pipe(logger('js'))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(pathInner.join(config.DEST_PATH, dest)))
        .on('error', rejecting)
        .on('end', resolve);
      return pipe;
    });
  });

  return tasks;
};
