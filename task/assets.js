'use strict';

const pathInner = require('path');
const fs = require('fs');

const MS_TO_ASSETS_DIVIDER = 1500;
const START_FROM = 976937420;
const RADIX = 27;

/**
 * @param {Object} gulp
 * @param {Object} conf
 * @return {Array[]}
 */
module.exports = function dependenciesJs(gulp, conf) {
  const tasks = [];

  if (!conf.to) {
    console.warn('generate:assets skip: You must set "to" filename');
  }
  conf.to = pathInner.resolve(conf.to);

  tasks.push([
    'generate:assets',
    function exportBuildTime() {
      return new Promise((res, rej) => {
        const assets = Math.round(Date.now() / MS_TO_ASSETS_DIVIDER - START_FROM).toString(RADIX);
        const format = conf.format || '"%hash%"';
        const out = format.replace('%hash%', assets)
        fs.writeFile(conf.to, out, {}, (err) =>
          err ? rej(err) : res()
        );
      });
    },
  ]);

  return tasks;
};
