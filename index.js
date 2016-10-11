/* eslint-disable global-require */
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
            let segment = file.replace(settings.path, '').split(path.sep);
            if (segment) {
              segment.pop();
              segment = segment.join('/');
            }
            const routeObj = require(path.join(settings.path, file));

            _.forIn(routeObj, (route) => {
              if (options.routeConfig) {
                if (route.config) {
                  route.config = _.defaults(options.routeConfig, route.config);
                } else {
                  route.config = options.routeConfig;
                }
              }
              let tmpPath = route.path || '';
              // create extension if that is required
              if ((tmpPath === '' || _.first(tmpPath) !== '/') && segment) {
                tmpPath = `${segment}/${tmpPath}`;
              }

              // create base route if one is provided:
              if ((tmpPath === '/' || tmpPath === '') && settings.base) {
                server.route({
                  config: route.config,
                  method: route.method,
                  path: settings.base,
                  vhost: route.vhost,
                  handler: route.handler
                });
                return;
              }
              // create root route
              if (_.first(tmpPath) === '/' && settings.base) {
                server.route(route);
                return;
              }
              // create an extended path
              route.path = `${_.trimRight(settings.base, '/')}/${_.trimRight(tmpPath, '/')}`;
              if (settings.verbose) {
                server.log(['hapi-route-loader', 'debug'], { message: 'route loaded', route });
              }
              server.route(route);
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
