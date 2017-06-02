'use strict';
const path = require('path');
const _ = require('lodash');

// the 'base' of the path for all routes defined in a given file.
// eg "/api/folder1/myfile.js" will return "/api/folder/myfile/",
module.exports = (options, fileName) => {
  // gets relative path, minus absolute path specifier:
  const segment = path.dirname(fileName.replace(options.path, ''));
  let base = options.base;
  if (segment === '.' || !segment) {
    return base;
  }
  if (!_.endsWith(options.base, '/')) {
    base += '/';
  }
  return `${base}${segment}`;
};
