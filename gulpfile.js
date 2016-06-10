'use strict';

const defaultGulp = require('gulp');
const _ = require('lodash');
const defaultTwig = require('twig');
const rjs = require('gulp-requirejs-optimize');//todo

const env = process.env.NODE_ENV || process.env.SYMFONY_ENV || 'dev';
const defaultConfig = {
  ENV:          env,
  dependencies: {
    js:          {
      minify:     env !== 'dev',
      paths:      {
        '': ['./app/Resources/frontend'], // "./" вначале - текущая папка
        // 'js': ['frontend/javascripts'], // ничего вначале - текущая папка
        //'подПапка': ['./src/Rt/Bundle/AdminBundle/Resources/frontend'],//Друг, исправь меня!
      },
      extensions: ['js', 'es6'],
      babel:      {

        /*
         USE .babelrc INSTEAD
         */
      },
    },
    views:       {
      paths:      {
        '': ['/views'], // "/" вначале - текущая папка TODO
        //'подПапка/': ['/src/Rt/Bundle/AdminBundle/Resources/frontend/views',],//Друг, исправь меня!
      },
      extensions: ['twig'],
      options:    {
        module:         'amd',
        twig:           'twig',
        compileOptions: {
          viewPrefix: 'views/',
        },
      },
      twig:       defaultTwig,
    },
    stylesheets: {
      minify:       env !== 'dev',
      paths:        {
        '': './app/Resources/frontend',
      },
      extensions:   ['scss', 'css'],
      autoprefixer: [
        'last 2 version',
        'ie 10',
        'ios 6',
        'android 4',
      ],
    },
    fonts:       {
      paths:      {
        '': './app/Resources/frontend',
      },
      extensions: ['eot', 'svg', 'ttf', 'woff', 'woff2'],
    },
    images:      {
      paths:      {
        '': './app/Resources',
      },
      extensions: ['svg', 'jpg', 'jpeg', 'png', 'gif'],
    },
    bower:       {
      BOWER_JSON:       'bower.json', // relative to cwd
      BOWER_COMPONENTS: 'bower_components',
      flatten:          true,
      minify:           env !== 'dev',
      cwd:              '.',
    },
    cp:          {

      /*
       files: {'node_modules/twig/twig.min.js': 'twig'},     twig.min.js -> twig.js
       files: {'node_modules/twig/twig.min.js': 'twig/'},    twig.min.js -> twig/twig.min.js
       files: {'node_modules/twig/twig.min.js': 'twig/t'},   twig.min.js -> twig/t.js
       */
      files: {'node_modules/twig/twig.min.js': 'js/twig'},
    },
  },
  browsersync:  {
    watch: [
      __dirname + '../../Resources/frontend/**',
    ],
    WAIT:  800,
  },
  DEST_PATH:    './web/assets',
};
/* TODO
 // Если нужно подключить СИМОФНИ проект, расскоментировать
 const FRONTEND_MAPPER_BUNDLE_SRC = '../../../vendor/werkint/frontend-mapper-bundle/src';
 var symfonyConfig = require(`${FRONTEND_MAPPER_BUNDLE_SRC}/Resources/gulp/symfony-task`)('werkint:frontendmapper:config');
 //replace native bower.json
 require(`${FRONTEND_MAPPER_BUNDLE_SRC}/Resources/gulp/bower`)(symfonyConfig.bower);
 var symfonyJsPoints = require(`${FRONTEND_MAPPER_BUNDLE_SRC}/Resources/gulp/symfony-task`)('werkint:frontendmapper:dump');
 //merge js paths
 (function mergeJsPaths() {
 var configPaths = config.dependencies.js.paths;
 console.log(symfonyJsPoints)
 console.log(configPaths)
 _.each(symfonyJsPoints, function (v, k) {
 if (configPaths[v.name]) {
 if (!_.isArray(configPaths[v.name])) {
 configPaths[v.name] = [configPaths[v.name]]
 }
 } else {
 configPaths[v.name] = [];
 }
 configPaths[v.name].push(v.path);
 });
 console.log("\n\n", config.dependencies.js.paths)
 })();
 */


const assets = require('./task/assets');
const bower = require('./task/bower');
const browserSync = require('./task/browserSync');
const cp = require('./task/cp');
const fonts = require('./task/fonts');
const img = require('./task/img');
const js = require('./task/js');
const style = require('./task/style');
const twig = require('./task/twig');

/**
 * Automatic connect all tasks
 * @param {Object} gulp
 * @param {Object} config
 * @return {Object} gulp
 */
function lib(gulp = defaultGulp, config = defaultConfig) {
  _.each(config.dependencies, (conf) => _.defaults(conf, {DEST_PATH: config.DEST_PATH}));

  _.each(assets(gulp, config.generate.assets), ([taskName, deps, cb]) => gulp.task(taskName, deps, cb));
  _.each(bower(gulp, config.dependencies.bower), ([taskName, deps, cb]) => gulp.task(taskName, deps, cb));
  _.each(browserSync(gulp, config.browsersync), ([taskName, deps, cb]) => gulp.task(taskName, deps, cb));
  _.each(cp(gulp, config.dependencies.cp), ([taskName, deps, cb]) => gulp.task(taskName, deps, cb));
  _.each(fonts(gulp, config.dependencies.fonts), ([taskName, deps, cb]) => gulp.task(taskName, deps, cb));
  _.each(img(gulp, config.dependencies.images), ([taskName, deps, cb]) => gulp.task(taskName, deps, cb));
  _.each(js(gulp, config.dependencies.js), ([taskName, deps, cb]) => gulp.task(taskName, deps, cb));
  _.each(style(gulp, config.dependencies.stylesheets), ([taskName, deps, cb]) => gulp.task(taskName, deps, cb));
  _.each(twig(gulp, config.dependencies.views), ([taskName, deps, cb]) => gulp.task(taskName, deps, cb));

  gulp.task('sync', [
    'browserSync',
    'watch',
  ], _.noop);
  gulp.task('watch', [
    'dependencies:js:watch',
    'dependencies:views:watch',
    'dependencies:stylesheets:watch',
    'dependencies:fonts:watch',
    'dependencies:images:watch',
  ], _.noop);
  gulp.task('default', [
    'bower:dependencies',
    'dependencies:js:build',
    'dependencies:stylesheets:build',
    'dependencies:views:build', // todo upgrade
    'dependencies:cp:build', // todo
    'generate:assets',
    'dependencies:fonts:build',
    'dependencies:images:build',
  ], _.noop);
  return gulp;
}

lib.assets = assets;
lib.bower = bower;
// eslint-disable-next-line no-sync
lib.browserSync = browserSync;
lib.cp = cp;
lib.fonts = fonts;
lib.img = img;
lib.js = js;
lib.style = style;
lib.twig = twig;

module.exports = lib;

