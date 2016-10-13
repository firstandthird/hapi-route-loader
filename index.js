'use strict';
const fs = require('fs');
const glob = require('glob');
const path = require('path');
const _ = require('lodash');
const async = require('async');

const defaults = {
  path: `${process.cwd()}/routes`,
  base: '/',
  verbose: false,
  autoLoad: true
};

exports.register = (server, options, next) => {
  exports.routeLoader(server, options, next, true);
};

// the 'base' of the path for all routes defined in a given file.
// eg "/api/folder1/myfile.js" will return "/api/folder/myfile/",
const getRoutePathBase = (options, fileName) => {
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

// get the full route path
const getCompletePath = (options, fileName, extendedPath) => {
  let returnPath = extendedPath;
  const basePath = getRoutePathBase(options, fileName);
  // if the extendedPath started with a slash just return it:
  if (_.startsWith(returnPath, '/')) {
    return returnPath;
  }
  // otherwise add the basePath to the returnPath:
  returnPath = path.join(basePath ? basePath : '', returnPath ? returnPath : '').replace(new RegExp('(\\\\)', 'g'), '/');
  // if there's a trailing slash, make sure it should be there:
  if (_.endsWith(returnPath, '/') && !_.endsWith(basePath, '/') && returnPath !== '/') {
    returnPath = returnPath.substr(0, returnPath.length - 1);
  }
  return returnPath;
};

// get the full route config for an individual route:
const configureRoute = (options, fileName, originalRouteConfig) => {
  // set up the various route config stuffs:
  const processedRouteConfig = _.clone(originalRouteConfig);
  if (options.routeConfig) {
    if (originalRouteConfig.config) {
      processedRouteConfig.config = _.defaults(options.routeConfig, originalRouteConfig.config);
    } else {
      processedRouteConfig.config = options.routeConfig;
    }
  }
  // set up the route's path:
  processedRouteConfig.path = getCompletePath(options, fileName, originalRouteConfig.path);
  return processedRouteConfig;
};

exports.routeLoader = (server, options, next) => {
  const load = (loadOptions, loadDone) => {
    const stub = () => {};
    loadDone = loadDone || stub;
    const settings = _.clone(loadOptions);
    _.defaults(settings, defaults);
    // the main flow is here:
    async.auto({
      // confirm that settings.path exists and is a directory:
      confirmDirectoryExists: (done) => {
        fs.exists(settings.path, (exists) => {
          if (!exists) {
            server.log(['hapi-route-loader', 'warning'], { message: 'path doesnt exist', path: settings.path });
            return done(`path ${settings.path} does not exist`);
          }
          fs.stat(settings.path, (err, stat) => {
            if (err) {
              return done(err);
            }
            if (!stat.isDirectory()) {
              server.log(['hapi-route-loader', 'warning'], { message: 'path not a directory', path: settings.path });
              return done(`path ${settings.path} not a directory`);
            }
            return done();
          });
        });
      },
      // get the list of all matching route-containing files
      files: ['confirmDirectoryExists', (results, done) => {
        glob('**/*.js', {
          cwd: settings.path
        }, (globErr, files) => {
          if (globErr) {
            return done(globErr);
          }
          done(null, files);
        });
      }],
      // for each filename, get a list of the routes it defines:
      configureAllRoutes: ['files', (results, done) => {
        const routeConfigs = {};
        results.files.forEach((fileName) => {
          const fileRouteList = [];
          const moduleRoutes = require(path.join(settings.path, fileName));
          _.forIn(moduleRoutes, (originalRouteConfig) => {
            fileRouteList.push(configureRoute(settings, fileName, originalRouteConfig));
          });
          routeConfigs[fileName] = fileRouteList;
        });
        done(null, routeConfigs);
      }],
      // register all routes with server.route:
      registerAllRoutes: ['configureAllRoutes', (results, done) => {
        Object.keys(results.configureAllRoutes).forEach((fileName) => {
          results.configureAllRoutes[fileName].forEach((routeConfig) => {
            if (options.verbose) {
              server.log(['debug', 'hapi-route-loader'], { msg: 'registering', data: routeConfig });
            }
            server.route(routeConfig);
          });
        });
        done();
      }]
    }, (err2) => {
      if (err2) {
        server.log(['hapi-route-loader', 'error'], err2);
      }
      return loadDone(err2);
    });
  };
  if (options.autoLoad === false) {
    return next();
  }
  load(options, next);
};

exports.register.attributes = {
  pkg: require('./package.json')
};
