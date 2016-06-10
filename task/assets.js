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
      const assets = Math.round(Date.now() / MS_TO_ASSETS_DIVIDER - START_FROM).toString(RADIX);
      return new Promise((res, rej) =>
        fs.writeFile(conf.to, JSON.stringify(assets), {}, (err) =>
          err ? rej(err) : res()
        )
      );
    },
  ]);

  return tasks;
};
