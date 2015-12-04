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
  exports.routeLoader(server, options, next, true);
}

exports.routeLoader = function(server,options, next){
  var load = function(options, done) {
    done = done || function() {};
    var settings = _.clone(options);
    _.defaults(settings, defaults);

    fs.exists(settings.path, function(exists) {
      if (!exists) {
        return done(new Error(settings.path + 'doesn\'t exist'));
      }
      fs.stat(settings.path, function(err, stat) {

        if (err) {
          return done(err);
        }
        if (!stat.isDirectory()) {
          return done(new Error(settings.path + ' is not a directory'));
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

  if (options.autoLoad === false) {
    return next();
  }
  load(options, next);

};

exports.register.attributes = {
  pkg: require('./package.json')
};
