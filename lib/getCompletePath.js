const path = require('path');
const _ = require('lodash');
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
  if (!_.endsWith(options.base, '/')) {
    base += '/';
  }
  return `${base}${segment}`;
};

// get the full route path:
module.exports = (options, fileName, originalPath) => {
  const prefix = options.prefix ? options.prefix : defaults.prefix;
  // if the originalPath started with a slash just return it, there is no basePath:
  if (_.startsWith(originalPath, '/')) {
    let resultPath = `${prefix}${originalPath}`;
    if (_.endsWith(resultPath, '/') && resultPath !== '/') {
      resultPath = resultPath.substr(0, resultPath.length - 1);
    }

    return resultPath;
  }
  // otherwise add the basePath to the returnPath:
  const basePath = getRoutePathBase(options, fileName);
  let returnPath = path.join(basePath, originalPath || '').replace(new RegExp('(\\\\)', 'g'), '/');
  returnPath = `${prefix}${returnPath}`;
  // if there's a trailing slash, make sure it should be there:
  if (_.endsWith(returnPath, '/') && (!_.endsWith(basePath, '/') || basePath === '/') && returnPath !== '/') {
    returnPath = returnPath.substr(0, returnPath.length - 1);
  }
  if (_.startsWith(returnPath, '//')) {
    returnPath = returnPath.replace('//', '/');
  }
  return returnPath;
};
