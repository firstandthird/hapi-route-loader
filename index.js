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
            console.log('+++ so segment is')
            console.log(segment)
            console.log('because path was %s', settings.path)
            if (segment) {
              segment.pop();
              segment = segment.join('/');
            }
            console.log('and in the end segment was')
            console.log(segment)
            // what you need to do is make segment work or get the dirname of settings.path
            const routeObj = require(path.join(settings.path, file));
            _.forIn(routeObj, (route) => {
              // console.log('+')
              // console.log(path.dirname(`${file}/${route.path}`));
              if (options.routeConfig) {
                if (route.config) {
                  route.config = _.defaults(options.routeConfig, route.config);
                } else {
                  route.config = options.routeConfig;
                }
              }
              const tmpPath = route.path || '';
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
              route.path = _.trimRight(settings.base, '/');
              if (_.startsWith(tmpPath, '/')) {
                route.path += tmpPath;
              } else if (segment) {
                route.path += `/${segment}/${_.trimLeft(tmpPath, '/')}`;
              } else {
                route.path += `/${tmpPath}`;
              }
              if (settings.verbose) {
                server.log(['hapi-route-loader', 'debug'], { message: 'route loaded', route });
              }
              if (route.path !== tmpPath) {
                console.log('*')
                console.log(route)
                server.route(route);
              }
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
