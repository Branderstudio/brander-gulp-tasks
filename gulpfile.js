'use strict';

const defaultGulp = require('gulp');
const _ = require('lodash');
const defaultTwig = require('twig');

const env = process.env.NODE_ENV || process.env.SYMFONY_ENV || 'dev';
const defaultConfig = {
  ENV:          env,
  dependencies: {
    js:          {
      minify:     env !== 'dev',
      paths:      {
        '': ['frontend', './app/Resources/frontend'], // "./" вначале - текущая папка
        // 'js': ['frontend/javascripts'], // или ничего вначале - текущая папка
        //'подПапка': х'./src/Rt/Bundle/AdminBundle/Resources/frontend'], // в 'подПапка' положется содержимое
      },
      extensions: ['js', 'es6'], // какие файлы искать
      babel:      {

        /*
         возле своих js файлов стоит создавать .babelrc в котором и писать конфигурацию по их транспайлингу
         USE .babelrc INSTEAD
         */
      },
      // DEST_PATH:  './public/dependencies/js' // можно явно указать относительно какой папки создавать 'подПапка'
    },
    views:       {
      paths:      {
        '': ['views', './app/Resources/frontend'], // "./" вначале - текущая папка
        //'подПапка': ['./src/Rt/Bundle/AdminBundle/Resources/frontend/views',], // Всё аналогично
      },
      extensions: ['twig'],
      options:    {
        module:         'amd',
        twig:           'twig',
        compileOptions: {
          viewPrefix: 'templates/',
        },
      },
      twig:       defaultTwig, // можно и нужно установить свой twig, для сборки он будет модифицирован
      // DEST_PATH:  './public/dependencies/js' // аналогично
    },
    stylesheets: {
      minify:       env !== 'dev',
      paths:        {
        '': ['frontend', './app/Resources/frontend'],
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
        '': ['frontend', './app/Resources/frontend'],
      },
      extensions: ['eot', 'svg', 'ttf', 'woff', 'woff2'],
    },
    images:      {
      paths:      {
        '': ['frontend', './app/Resources/frontend'],
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
      files: {
        'node_modules/twig/twig.min.js': 'twig',
        /*
         files: {'node_modules/twig/twig.min.js': 'twig'},     twig.min.js -> twig.js
         files: {'node_modules/twig/twig.min.js': 'twig/'},    twig.min.js -> twig/twig.min.js
         files: {'node_modules/twig/twig.min.js': 'twig/t'},   twig.min.js -> twig/t.js
         */
      },
      // DEST_PATH: './public/dependencies/js'
    },
  },
  build:        {
    rjs:    {
      entryPoints:    {
        'page/testFrontend': {/* out: 'js/page/testFrontend__.js' */}, //сюда можно вписать конфиг
      },
      defaultOptions: {

        /** @link https://github.com/requirejs/r.js/blob/master/build/example.build.js */
        /** @link https://github.com/jlouns/gulp-requirejs-optimize#differences-from-rjs */
        mainConfigFile: './public/dependencies/js/config/require.js', // конфиг рекваер жс
        // stubModules: ['text', 'json', 'json!/translations'],
        // inlineText: true,
        // pragmas: {
        //   excludeRequireCss: true
        // }
        inlineJSON:     false,
        // inlineTWIG: false,
        // appDir: 'public',
        // out:            `js/page/testFrontend__.js`, // полезно сделать для конкретного файла
      },
      // DEST_PATH:      './public/dependencies/js',
    },
    concat: {
      entryPoints: {
        'require.js': [
          'public/dependencies/js/require.js',
          'public/dependencies/js/config/require.js',
          'public/dependencies/js/config/boost.js',
        ],
      },
      options:     {newLine: ';\n'},
      // DEST_PATH:   './public/dependencies/js',
    },
  },
  browsersync:  {
    watch: [
      'views/*.twig',
      'src/**/Resources/frontend/**/*',
      'web/assets/**/*',
    ],

    /*
     options: {
     https: {
     key:  path.join(__dirname, 'config', 'keys', 'server', 'privkey.pem'),
     cert: path.join(__dirname, 'config', 'keys', 'server', 'fullchain.pem')
     }
     },
     */
    WAIT:  800, // ms
  },
  generate:     {
    assets: {
      // to: './fixtures/assets.json' // -> create file with hash string
    },
  },
  DEST_PATH:    './web/assets', // default destination
};

const assets = require('./task/assets');
const bower = require('./task/bower');
const browserSync = require('./task/browserSync');
const build = require('./task/build');
const cp = require('./task/cp');
const fonts = require('./task/fonts');
const img = require('./task/img');
const js = require('./task/js');
const rjs = require('./task/r');
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
  _.each(config.build, (conf) => _.defaults(conf, {DEST_PATH: config.DEST_PATH}));

  _.each(assets(gulp, config.generate.assets), ([taskName, deps, cb]) => gulp.task(taskName, deps, cb));
  _.each(bower(gulp, config.dependencies.bower), ([taskName, deps, cb]) => gulp.task(taskName, deps, cb));
  _.each(browserSync(gulp, config.browsersync), ([taskName, deps, cb]) => gulp.task(taskName, deps, cb));
  _.each(build(gulp, config.build.concat), ([taskName, deps, cb]) => gulp.task(taskName, deps, cb));
  _.each(cp(gulp, config.dependencies.cp), ([taskName, deps, cb]) => gulp.task(taskName, deps, cb));
  _.each(fonts(gulp, config.dependencies.fonts), ([taskName, deps, cb]) => gulp.task(taskName, deps, cb));
  _.each(img(gulp, config.dependencies.images), ([taskName, deps, cb]) => gulp.task(taskName, deps, cb));
  _.each(js(gulp, config.dependencies.js), ([taskName, deps, cb]) => gulp.task(taskName, deps, cb));
  _.each(rjs(gulp, config.build.rjs), ([taskName, deps, cb]) => gulp.task(taskName, deps, cb));
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
    'dependencies:views:build',
    'dependencies:cp:build',
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
lib.rjs = rjs;
lib.style = style;
lib.twig = twig;

module.exports = lib;
