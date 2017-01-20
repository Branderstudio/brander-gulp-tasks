## About

This is set of gulp tasks for common usage. It is wrapper over popular gulp things.
It is flexible reusable and easy configurable.

## What it can

1. create hash of build time in custom format
2. install bower with custom configuration
3. browser sync
4. requirejs build, optimize, concat
5. just copy file from one place to another
6. copy (for now) fonts, images
7. process SCSS, autoprefixer
8. build TWIG templates for twigjs

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

#### Advanced require js example

```js
  build:        {
    rjs:    {
      entryPoints:    {
        'amd/entryPointAdmin':           {
          stubModules:    [], // there is no stub modules for "Admin"
        },
        'amd/salonEntryPoint':           {},
        'amd/loginEntryPoint':           {},
        'amd/entryPointChangePassword':  {},
        'amd/entryPointRecoverPassword': {},
      },
      defaultOptions: {
        mainConfigFile: './public/compiled/js/amd/require.js.config.js',
        stubModules:    ['toastr'],
        // inlineText: true,
        // pragmas: {
        //   excludeRequireCss: true,
        // },
        inlineJSON:     false,
        optimize:       'none',
        // makes stub modules dynamically loaded
        onBuildWrite(moduleName, path, contents) {
          return contents.replace(/define\('[^']+',\{}\);/g, '');
        },
        // inlineView:     false,
        // inlineTWIG:     false,
      },
      DEST_PATH:      './public/compiled/js',
    },
    concat: {
      entryPoints: {
        'js/require_build.js': [
          'public/compiled/js/require.js',
          'public/compiled/js/amd/require.js.config.js',
          'public/compiled/js/amd/boost.js',
        ],
      },
      options:     {newLine: ';\n'},
    },
  },
```