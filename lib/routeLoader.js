const fs = require('fs');
const glob = require('glob');
const path = require('path');
const _ = require('lodash');
const async = require('async');
const defaults = require('./defaults');
const getCompletePath = require('./getCompletePath');

module.exports = (server, options, next) => {
  const load = (loadOptions, loadDone) => {
    const stub = () => {};
    loadDone = loadDone || stub;
    const settings = _.clone(loadOptions);
    _.defaults(settings, defaults);
    // the main flow is here:
    async.autoInject({
      // confirm that settings.path exists and is a directory:
      confirmDirectoryExists(done) {
        fs.exists(settings.path, (exists) => {
          if (!exists) {
            server.log(['hapi-route-loader', 'warning'], { message: 'path doesnt exist', path: settings.path });
            return done();
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
      files(confirmDirectoryExists, done) {
        glob('**/*.js', {
          cwd: settings.path
        }, (globErr, files) => {
          if (globErr) {
            return done(globErr);
          }
          done(null, files);
        });
      },
      // for each filename, get a list of configured routes defined by it
      configureAllRoutes(files, done) {
        const routeConfigs = {};
        files.forEach((fileName) => {
          const fileRouteList = [];
          const moduleRoutes = require(path.join(settings.path, fileName));
          _.forIn(moduleRoutes, (originalRouteConfig) => {
            if (typeof originalRouteConfig === 'function') {
              originalRouteConfig = originalRouteConfig(server, settings);
            }
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
      },
      // register all routes with server.route:
      registerAllRoutes: (configureAllRoutes, done) => {
        Object.keys(configureAllRoutes).forEach((fileName) => {
          configureAllRoutes[fileName].forEach((routeConfig) => {
            if (options.verbose) {
              server.log(['debug', 'hapi-route-loader'], { msg: 'registering', data: routeConfig });
            }
            server.route(routeConfig);
          });
        });
        done();
      }
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
