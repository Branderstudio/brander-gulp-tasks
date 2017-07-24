'use strict';

const pathInner = require('path');
const cp = require('child_process');
const bower = require('main-bower-files');
const rename = require('gulp-rename');
const bowerNormalizer = require('gulp-bower-normalize');
const uglify = require('gulp-uglify');
const gulpif = require('gulp-if');

const helpers = require('./helpers');
const logger = helpers.logger;

/**
 * @param {Object} gulp
 * @param {Object} conf
 * @return {Array[]}
 */
module.exports = function dependenciesJs(gulp, conf) {
  const tasks = [];

  conf.cwd = conf.cwd ? pathInner.resolve(conf.cwd) : process.cwd();

  const extraRelativeBowerJson = pathInner.relative(process.cwd(), pathInner.resolve(conf.cwd, conf.BOWER_JSON));
  const bowerJson = require(pathInner.join(conf.cwd, conf.BOWER_JSON));
  const renameConfig = bowerJson && bowerJson.overrides && bowerJson.overrides.renames || {};

  tasks.push([
    'bower:dependencies',
    ['bower:install'],
    function bowerDump() {
      const paths = {
        bowerDirectory: conf.BOWER_COMPONENTS,
        bowerJson:      extraRelativeBowerJson,
        bowerrc:        pathInner.join(conf.cwd, '.bowerrc'),
      };
      return gulp.src(bower({paths}), {base: conf.BOWER_COMPONENTS})
        .pipe(bowerNormalizer({bowerJson: extraRelativeBowerJson, flatten: conf.flatten}))
        .pipe(logger('bower'))
        .pipe(rename((file) => {
          if (!renameConfig[file.basename]) {
            return;
          }
          file.basename = renameConfig[file.basename];
        }))
        .pipe(gulpif((file) => conf.minify && pathInner.parse(file.path).ext === '.js', uglify()))
        .pipe(gulp.dest(conf.DEST_PATH));
    },
  ]);
  tasks.push([
    'bower:install',
    [],
    function () {
      return new Promise((resolve, reject) => {
        const args = [
          'install',
          '--config.interactive=false',
          `--config.directory=${pathInner.relative(conf.cwd, conf.BOWER_COMPONENTS)}`,
          '--allow-root',
          '--production',
        ];
        helpers.isModuleInstalledLocally('bower').then(function (bowerExists) {
          cp.spawn(
            bowerExists ? './node_modules/.bin/bower' : 'bower',
            args,
            {stdio: 'inherit', cwd: conf.cwd}
          ).on('close', (code) => code ? reject() : resolve());
        }).catch(reject);
      });
    },
  ]);

  return tasks;
};
