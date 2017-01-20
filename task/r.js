'use strict';

const pathInner = require('path');
const _ = require('lodash');
const rjs = require('gulp-requirejs-optimize');
const helpers = require('./helpers');
const uglify = require('gulp-uglify');

/**
 * @param {Object} gulp
 * @param {Object} conf
 * @return {Array[]}
 */
module.exports = function rjsTasks(gulp, conf) {
  const tasks = [];

  tasks.push([
    'build:rjs',
    ['default'],
    function rjsBuildEntryPoints() {
      const logger = helpers.logger('rjs');
      const jobs = _.map(conf.entryPoints, (options, entryPoint) => {
        const file = pathInner.join(conf.DEST_PATH, `${entryPoint}.js`);
        const opt = _.defaults(options, conf.defaultOptions);
        return new Promise((resolve, reject) => {
          const rejecting = helpers.rejector(reject);
          return gulp.src(file, {base: pathInner.resolve(opt.DEST_PATH || conf.DEST_PATH)})
            // .pipe(logger)
            .pipe(rjs(opt))
            .on('error', rejecting)
            .pipe(uglify())
            .pipe(gulp.dest(opt.DEST_PATH || conf.DEST_PATH))
            .on('end', resolve);
        });
      });
      return Promise.all(jobs);
    },
  ]);

  return tasks;
};
