'use strict';
const getRoutePathBase = require('./routePathBase.js');
const _ = require('lodash');
const path = require('path');

// get the full route path:
module.exports = (options, fileName, originalPath) => {
  // if the originalPath started with a slash just return it, there is no basePath:
  if (_.startsWith(originalPath, '/')) {
    return originalPath;
  }
  // otherwise add the basePath to the returnPath:
  const basePath = getRoutePathBase(options, fileName);
  let returnPath = path.join(basePath, originalPath ? originalPath : '').replace(new RegExp('(\\\\)', 'g'), '/');
  // if there's a trailing slash, make sure it should be there:
  if (_.endsWith(returnPath, '/') && !_.endsWith(basePath, '/') && returnPath !== '/') {
    returnPath = returnPath.substr(0, returnPath.length - 1);
  }
  if (_.startsWith(returnPath, '//')) {
    returnPath = returnPath.replace('//', '/');
  }
  return returnPath;
};
