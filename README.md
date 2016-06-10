## install

## requirements
nodejs v6+

## run
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

## usage

### very simple way
```javascript
const gulp            = require('gulp');
const branderGulp     = require('brander-gulp-tasks');

branderGulp(gulp/*, config*/);

```

## minify

```bash
env NODE_ENV=prod gulp
```

OR
```bash
env SYMFONY_ENV=prod gulp
```