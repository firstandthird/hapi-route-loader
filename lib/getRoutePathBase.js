const path = require('path');
const defaults = require('./defaults');

// the 'base' of the path for all routes defined in a given file.
// eg "/api/folder1/myfile.js" will return "/api/folder/myfile/",
const getRoutePathBase = (options, fileName) => {
  // gets relative path, minus absolute path specifier:
  const segment = path.dirname(fileName.replace(options.path, ''));
  let base = options.base ? options.base : defaults.base;
  if (segment === '.' || !segment) {
    return base;
  }
  if (options.base && options.base.endsWith('/')) {
    base += '/';
  }
  return `${base}${segment}`;
};

module.exports = getRoutePathBase;
