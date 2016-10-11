'use strict';
const fs = require('fs');
const glob = require('glob');
const path = require('path');
const _ = require('lodash');

const defaults = {
  path: `${process.cwd()}/routes`,
  base: '/',
  verbose: false,
  autoLoad: true
};

exports.register = (server, options, next) => {
  exports.routeLoader(server, options, next, true);
};

// gets the root of the full route name for a given module of routes
// individual routes in this file are appended to this base to get the final endpoint
// eg "/api/folder1/myfile.js" will return "/api/folder/myfile/"
const deriveRouteBase = (options, settings, fileName) => {
  let segment = file.replace(settings.path, '').split(path.sep);
  if (segment) {
    segment.pop();
    segment = segment.join('/');
  }
};

// get the full route config for an individual route:
const processRouteConfig = (options, basePath, originalRouteConfig) => {
  if (options.routeConfig) {
    if (originalRouteConfig.config) {
      originalRouteConfig.config = _.defaults(options.routeConfig, originalRouteConfig.config);
    } else {
      originalRouteConfig.config = options.routeConfig;
    }
  }
  let tmpPath = originalRouteConfig.path || '';
  originalRouteConfig.path = basePath ? `${basePath}/${tmpPath}` : tmpPath;
  // create extension if that is required
  if ((tmpPath === '' || _.first(tmpPath) !== '/') && segment) {
    tmpPath = `${segment}/${tmpPath}`;
  }
};

// returns a list containing the route Configs for a file:
const listRoutes = (options, settings, fileName) => {
  const allRoutes = [];
  const base = deriveRouteBase(options, settings, fileName)
  const moduleRoutes = require(path.join(settings.path, fileName));
  _.forIn(moduleRoutes, (originalRouteConfig) => {
    const processedRouteConfig = processRouteConfig(options, originalRouteConfig);
    processedRouteConfig.path = ``
    allRoutes.push(processedRouteConfig);
  });
};

exports.routeLoader = (server, options, next) => {
  const load = (loadOptions, done) => {
    const stub = () => {};
    done = done || stub;
    const settings = _.clone(loadOptions);
    _.defaults(settings, defaults);

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
          return done();
        }

        glob('**/*.js', {
          cwd: settings.path
        }, (globErr, files) => {
          if (globErr) {
            return done(globErr);
          }
          files.forEach((file) => {
            listRoutes(options, settings, file).forEach((routeConfig) => {
              server.route(routeConfig);
            });
              // create base route if one is provided:
              if ((tmpPath === '/' || tmpPath === '') && settings.base) {
                console.log('^^')
                console.log(route)
                console.log('^^')
                console.log('base is %s', settings.base)
                return server.route({
                  config: route.config,
                  method: route.method,
                  path: settings.base,
                  vhost: route.vhost,
                  handler: route.handler
                });
              }
              // create root route
              if (_.first(tmpPath) === '/' && settings.base) {
                return server.route(route);
              }
              // create an extended path
              route.path = `${_.trimRight(settings.base, '/')}/${_.trimRight(tmpPath, '/')}`;
              if (settings.verbose) {
                server.log(['hapi-route-loader', 'debug'], { message: 'route loaded', route });
              }
              console.log('==========')
              console.log('==========')
              console.log('==========')
              console.log(route)
              return server.route(route);
            });
          });
          done();
        });
      });
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
