'use strict';

const pathInner = require('path');
const _ = require('lodash');
const watch = require('gulp-watch');
const sourcemaps = require('gulp-sourcemaps');
const progeny = require('gulp-progeny');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const cmq = require('gulp-merge-media-queries');
const minifyCss = require('gulp-clean-css');

const helpers = require('./helpers');
const logger = helpers.logger;


module.exports = function dependenciesCss(gulp, conf) {
  const tasks = [];
  conf.progeny = conf.progeny || {
    regexp:         /^\s*@import\s*['"]?([^'"]+)['"]?/,
    prefix:         '_',
    extensionsList: ['scss'],
    multipass:      [
      /@import[^;]+;/g,
      /\s*['"][^'"]+['"]\s*,?/g,
      /(?:['"])([^'"]+)/,
    ],
  };
  (function (handle) {
    helpers.normalizePaths(conf);

    tasks.push([
      'dependencies:stylesheets:watch',
      ['dependencies:stylesheets:build'],
      function cssWatch() {
        return helpers.watchAutoHandle(conf, handle, watch);
      },
    ]);
    tasks.push([
      'dependencies:stylesheets:build',
      [],
      function cssBuild() {
        const result = [];
        _.each(conf.paths, (paths, dest) => {
          _.each(paths, (path) => result.push(handle(conf, path, dest)));
        });

        return Promise.all(result);
      },
    ]);
  })(function handleCss(config, paths, dest, base) {
    return new Promise((resolve, reject) => {
      const rejecting = helpers.rejector(reject);
      let pipe = gulp.src(paths, {base})
        .pipe(sourcemaps.init())
        .pipe(progeny(config.progeny))
        .on('error', rejecting)
        .pipe(sass())
        .on('error', rejecting)
        .pipe(autoprefixer(config.autoprefixer))
        .on('error', rejecting)
        .pipe(cmq())
        .on('error', rejecting);
      if (config.minify) {
        pipe = pipe.pipe(minifyCss());
      }
      pipe = pipe
        .pipe(sourcemaps.write())
        .pipe(logger('stylesheets'))
        .pipe(gulp.dest(pathInner.join(config.DEST_PATH, dest)))
        .on('end', resolve);
      return pipe;
    });
  });

  return tasks;
};
