'use strict';

const pathInner = require('path');
const watch = require('gulp-watch');
const _ = require('lodash');

const helpers = require('./helpers');
const getPaths = helpers.getPaths;
const logger = helpers.logger;

module.exports = function dependenciesJs(gulp, conf) {
  const tasks = [];
  (function (handle) {
    helpers.normalizePaths(conf);

    tasks.push([
      'dependencies:fonts:watch',
      ['dependencies:fonts:build'],
      function fontsWatch() {
        return helpers.watchAutoHandle(conf, handle, watch);
      },
    ]);
    tasks.push([
      'dependencies:fonts:build',
      [],
      function fontsBuild() {
        const result = [];
        _.each(conf.paths, (paths, dest) => {
          _.each(paths, (path) => result.push(handle(conf, path, dest)));
        });

        return Promise.all(result);
      },
    ]);
  })((config, path, dest, base) =>
    new Promise((resolve, reject) => {
      gulp.src(path, {base})
        .pipe(logger('fonts'))
        .pipe(gulp.dest(pathInner.join(config.DEST_PATH, dest)))
        .on('error', reject)
        .on('end', resolve);
    })
  );

  return tasks;
};
