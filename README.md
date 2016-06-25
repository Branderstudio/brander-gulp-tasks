## About

This is set of gulp tasks for common usage. It is wrapper over popular gulp things.
It is flexible reusable and easy configurable.

## install

```bash
npm i --save-dev brander-gulp-tasks gulp
```

Often you want to use babel with presets, transformers, then you type something like

```bash
npm i --save-dev babel-plugin-transform-es2015-modules-umd babel-preset-es2015
```

## requirements

 - nodejs v6+
 - npm

## usage

### run
```bash
gulp
```

OR
```bash
./node_modules/.bin/gulp
```

OR
```bash
./node_modules/brander-gulp-tasks/node_modules/.bin/gulp
```

### very simple way
```javascript
const gulp            = require('gulp');
const branderGulp     = require('brander-gulp-tasks');

branderGulp(gulp/*, config*/);

```

### minify

```bash
env NODE_ENV=prod gulp
```

OR
```bash
env SYMFONY_ENV=prod gulp
```

### optimize

```bash
env NODE_ENV=prod gulp build
```
Do not use without minifing, unless you don't use NODE_ENV
```bash
gulp build
```