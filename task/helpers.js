'use strict';

/**
 * *namespace helpers
 * @module helpers
 */

const pathInner = require('path');
const cp = require('child_process');
const gulpPrint = require('gulp-print');
const _ = require('lodash');
const fs = require('fs');
const minimatch = require('minimatch');
const chalk = require('chalk');

/**
 * @param {String} path
 * @param {Array<String>} extensions
 * @return {Array<String>}
 */
function getPaths(path, extensions) {
  return _.map(extensions, (ext) => `${path}/**/*.${ext}`);
}

function logger(prefix) {
  return gulpPrint((filepath) => `${prefix}: ${filepath}`);
}

function rejector(reject) {
  return (err, ...rest) => {
    console.log(chalk.bgRed.black(err));
    if (rest.length) {
      console.log(...rest);
    }
    reject(err);
  };
}

/**
 * @param {Array<String>} paths
 * @param {String} path
 * @return {boolean|String}
 */
function matchPath(paths, path) {
  return _.find(paths, (v) => minimatch(path, v));
}

/**
 * @param {String} pathBlob
 * @return {String}
 */
function getBase(pathBlob) {
  return pathBlob.replace(/\/\*\*\/\*\..*/, '');
}

/**
 * @mutate
 * @param {Object} conf
 * @param {Object} conf.paths
 * @param {String[]} conf.extensions
 */
function normalizePaths(conf) {
  _.each(conf.paths, (v, dest) => {
    if (!_.isArray(v)) {
      conf.paths[dest] = [v];
    }
    conf.paths[dest] = _.reduce(conf.paths[dest], (result, path) => {
      const pathResolved = pathInner.resolve(path);
      return _.union(result, getPaths(pathResolved, conf.extensions));
    }, []);
  });
}

/**
 * This callback return a promise object for gulp or gulp watch
 *
 * @callback promisedHandleCallback
 * @param {Object} conf
 * @param {Object} conf.paths
 * @param {String[]} conf.extensions
 * @param {String} filePath
 * @param {String} destination
 * @param {String} basePath
 * @return {Promise}
 */

/**
 * @param {Object} conf
 * @param {Object} conf.paths
 * @param {String[]} conf.extensions
 * @param {promisedHandleCallback} handle
 * @param {Function} watch
 * @return {Pipe}
 */
function watchAutoHandle(conf, handle, watch) {
  const watchPaths = _.reduce(conf.paths, (result, paths) => _.union(result, paths), []);
  return watch(watchPaths, (file) =>
    _.each(conf.paths, (paths, dest) => {
      let base = matchPath(paths, file.path);
      if (base) {
        base = getBase(base);
        // console.log(file.path, dest, base)
        return handle(conf, file.path, dest, base);
      }
      return null;
    })
  );
}

/**
 * @param {String} fileName
 * @param {*} data
 * @param {Object} [options={}]
 * @return {Promise<String>}
 */
function wf(fileName, data, options = {}) {
  return new Promise((res, rej) =>
    fs.writeFile(fileName, data, options, (err) =>
      err ? rej(err) : res(fileName)
    )
  );
}

/**
 * @param {String} fileName
 * @param {Object} [options={encoding: 'utf8'}]
 * @return {Promise<String>}
 */
function rf(fileName, options = {encoding: 'utf8'}) {
  return new Promise((res, rej) =>
    fs.readFile(fileName, options, (err, data) =>
      err ? rej(err) : res(data)
    )
  );
}

function isModuleInstalledLocally(moduleName) {
  return new Promise((resolve) => {
    const modulesListGetProcess = cp.spawn(
      'npm',
      ['ls', moduleName, '-parseable=true', '-link=true', '--depth=0'],
      {stdio: 'pipe', cwd: process.cwd(), env: process.env}
    );

    let modulesList = '';

    modulesListGetProcess.stdout.on('data', data => {
      modulesList = modulesList + data.toString();
    });

    // unmeet peer dependency exits with non-zero code, ignore it
    modulesListGetProcess.on('close', () => {
      resolve(!!modulesList)
    })
  })
}

const helpers = {
  getPaths,
  logger,
  matchPath,
  getBase,
  rejector,
  normalizePaths,
  watchAutoHandle,
  wf,
  rf,
  isModuleInstalledLocally,
};

module.exports = helpers;
