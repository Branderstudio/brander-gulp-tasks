'use strict';

const pathInner = require('path');
const _ = require('lodash');
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');
const helpers = require('./helpers');

/**
 * @param {Object} gulp
 * @param {Object} conf
 * @return {Array[]}
 */
module.exports = function rjsTasks(gulp, conf) {
  const tasks = [];

  tasks.push([
    'build:concat',
    ['default'],
    function concatFiles() {
      const logger = helpers.logger('concat');
      const jobs = _.map(conf.entryPoints, (files, entryPoint) =>
        new Promise((resolve, reject) => {
          const rejecting = helpers.rejector(reject);
          return gulp.src(files, {base: pathInner.resolve(conf.DEST_PATH)})
            .pipe(logger)
            .pipe(uglify())
            .pipe(concat(entryPoint, conf.options))
            .on('error', rejecting)
            .pipe(gulp.dest(conf.DEST_PATH))
            .on('end', resolve);
        })
      );
      return Promise.all(jobs);
    },
  ]);

  tasks.push([
    'build',
    ['build:rjs', 'build:concat'],
    _.noop,
  ]);
  return tasks;
};
