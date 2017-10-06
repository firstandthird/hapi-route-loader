const path = require('path');
const defaults = require('./defaults');
const getRoutePathBase = require('./getRoutePathBase');

// get the full route path:
module.exports = (options, fileName, originalPath) => {
  const prefix = options.prefix ? options.prefix : defaults.prefix;
  // if the originalPath started with a slash just return it, there is no basePath:
  if (originalPath && originalPath.startsWith('/')) {
    return `${prefix}${originalPath}`;
  }
  // otherwise add the basePath to the returnPath:
  const basePath = getRoutePathBase(options, fileName);
  let returnPath = path.join(basePath, originalPath || '').replace(new RegExp('(\\\\)', 'g'), '/');
  returnPath = `${prefix}${returnPath}`;
  // if there's a trailing slash, make sure it should be there:
  if (returnPath.endsWith('/') && (!basePath.endsWith('/') || basePath === '/') && returnPath !== '/') {
    if (!originalPath || !originalPath.endsWith('/')) {
      returnPath = returnPath.substr(0, returnPath.length - 1);
    }
  }
  if (returnPath.endsWith('//')) {
    returnPath = returnPath.replace('//', '/');
  }
  return returnPath;
};
