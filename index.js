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
const getCompletePath = (options, fileName, originalPath) => {
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
  return returnPath;
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
      // for each filename, get a list of configured routes defined by it
      configureAllRoutes: ['files', (results, done) => {
        const routeConfigs = {};
        results.files.forEach((fileName) => {
          const fileRouteList = [];
          const moduleRoutes = require(path.join(settings.path, fileName));
          _.forIn(moduleRoutes, (originalRouteConfig) => {
            const processedRouteConfig = _.clone(originalRouteConfig);
            // set up the route's 'config' option:
            if (options.routeConfig) {
              if (originalRouteConfig.config) {
                processedRouteConfig.config = _.defaults(options.routeConfig, originalRouteConfig.config);
              } else {
                processedRouteConfig.config = options.routeConfig;
              }
            }
            // set up the route's 'path' option:
            processedRouteConfig.path = getCompletePath(options, fileName, originalRouteConfig.path);
            fileRouteList.push(processedRouteConfig);
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
