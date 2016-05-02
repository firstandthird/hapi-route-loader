var fs = require('fs');
var glob = require('glob');
var path = require('path');
var _ = require('lodash');

var defaults = {
  path: process.cwd() + '/routes',
  base: '/',
  verbose: false,
  autoLoad: true
};
exports.register = function(server, options, next) {

  var load = function(options, done) {
    done = done || function() {};
    var settings = _.clone(options);
    _.defaults(settings, defaults);

    fs.exists(settings.path, function(exists) {
      if (!exists) {
        server.log(['hapi-route-loader', 'warning'], { message: 'path doesnt exist', path: settings.path });
        return done();
      }
      fs.stat(settings.path, function(err, stat) {

        if (err) {
          return done(err);
        }
        if (!stat.isDirectory()) {
          server.log(['hapi-route-loader', 'warning'], { message: 'path not a directory', path: settings.path });
          return done();
        }

        glob('**/*.js', {
          cwd: settings.path
        }, function(err, files) {
          if (err) {
            return done(err);
          }
          files.forEach(function(file) {
            var segment = file.replace(settings.path, '').split(path.sep);
            if (segment){
              segment.pop();
              segment = segment.join('/');
            }
            var routeObj = require(path.join(settings.path, file));
            _.forIn(routeObj, function(route) {
              var tmpPath = route.path || '';
              // create base route if one is provided:
              if ( (tmpPath=="/"||tmpPath=="") && settings.base){
                  server.route({
                    method: route.method,
                    path:  settings.base,
                    handler : route.handler
                  });
                  return;
              }
              // create root route
              if (_.first(tmpPath)=='/' && settings.base){
                server.route(route);
                return;
              }
              // create an extended path
              route.path = _.trimRight(settings.base, '/');
              if (_.startsWith(tmpPath, '/')) {
                route.path += tmpPath;
              } else if (segment){
                route.path += '/' + segment + '/' + _.trimLeft(tmpPath, '/');
              } else {
                route.path += '/' + tmpPath;
              }
              if (settings.verbose) {
                server.log(['hapi-route-loader', 'debug'], { message: 'route loaded', route: route });
              }
              if (route.path!=tmpPath)
              server.route(route);
            });
          });

          done();
        });
      });
    });
  };

  server.expose('load', load);
  if (options.autoLoad === false) {
    return next();
  }
  load(options, next);

};

exports.register.attributes = {
  pkg: require('./package.json')
};
