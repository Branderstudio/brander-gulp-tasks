'use strict';

const browserSyncInner = require('browser-sync');
const _ = require('lodash');

module.exports = (gulp, conf) => [
  [
    'browserSync',
    [],
    function browserSync() {
      browserSyncInner.create();
      browserSyncInner.init(conf.options || {});
      return gulp.watch(conf.watch).on(
        'change',
        _.debounce(browserSyncInner.reload, conf.WAIT)
      );
    },
  ],
];
