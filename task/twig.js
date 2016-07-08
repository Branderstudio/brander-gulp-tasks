'use strict';

const _ = require('lodash');
const pathInner = require('path');
const watch = require('gulp-watch');
const uglify = require('gulp-uglify');
const twigCompile = require('twig-compile');

const helpers = require('./helpers');
const rejector = helpers.rejector;
const logger = helpers.logger;

module.exports = function dependenciesJs(gulp, conf) {
  const tasks = [];

  (function (handle) {
    if (conf.twig) {
      twigCompile.setTwig(conf.twig);
    }
    const watchBasePaths = [];
    const lookPaths = conf.options.compileOptions.lookPaths = {};

    _.each(conf.paths, (v, dest) => {
      if (!_.isArray(v)) {
        conf.paths[dest] = [v];
      }
      conf.paths[dest] = _.reduce(conf.paths[dest], (result, p) => {
        const path = pathInner.resolve(p);
        if (lookPaths[dest]) {
          lookPaths[dest].push(path);
        } else {
          lookPaths[dest] = [path];
        }
        watchBasePaths.push({path, dest});
        return _.union(result, helpers.getPaths(path, conf.extensions));
      }, []);
    });

    tasks.push([
      'dependencies:views:build',
      [],
      function twigBuild() {
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
      'dependencies:views:watch', ['dependencies:views:build'], function twigWatch() {
        const watchPaths = _.reduce(conf.paths, (result, paths) => _.union(result, paths), []);
        conf.options.compileOptions.resetId = true;
        return watch(watchPaths, (file) => {
          _.each(watchBasePaths, ({path, dest}) => {
            if (file.path.indexOf(path) === 0) {
              return handle(conf, file.path, dest, path);
            }
            return null;
          });
        });
      },
    ]);
  })(function handle(configuration, paths, dest, base) {
    const config = _.merge({}, configuration);
    config.options.compileOptions.id = function (file) {
      return dest + file.relative;
    };
    return new Promise((resolve, reject) => {
      const rejecting = rejector(reject);
      let pipe = gulp.src(paths, {base})
        .pipe(twigCompile(config.options))
        .on('error', rejecting);
      if (config.minify) {
        pipe = pipe.pipe(uglify())
          .on('error', rejecting);
      }
      pipe = pipe
        .pipe(logger('views'))
        .pipe(gulp.dest(pathInner.join(config.DEST_PATH, config.options.compileOptions.viewPrefix, dest)))
        .on('error', rejecting)
        .on('end', resolve);
      return pipe;
    });
  });

  return tasks;
};
