var fs = require('fs');
var glob = require('glob');
var path = require('path');
var _ = require('lodash');

var defaults = {
  path: process.cwd() + '/routes',
  base: '/',
  verbose: false
};
exports.register = function(server, options, next) {

  var settings = _.clone(options);
  _.defaults(settings, defaults);

  fs.stat(settings.path, function(err, stat) {

    if (err) {
      return next(err);
    }
    if (!stat.isDirectory()) {
      return next(new Error(settings.path + ' is not a directory'));
    }

    glob('**/*.js', {
      cwd: settings.path
    }, function(err, files) {
      if (err) {
        return next(err);
      }

      files.forEach(function(file) {
        var segment = file.replace(settings.path, '').split(path.sep);
        segment.pop();
        segment = segment.join('/');

        var routeObj = require(path.join(settings.path, file));

        _.forIn(routeObj, function(route) {
          var tmpPath = route.path || '';

          route.path = _.trimRight(settings.base, '/');

          if (_.startsWith(tmpPath, '/')) {
            route.path += tmpPath;
          } else {
            route.path += '/' + segment + '/' + _.trimLeft(tmpPath, '/');
          }

          if (settings.verbose) {
            server.log(['hapi-route-loader', 'debug'], { message: 'route loaded', route: route });
          }
          server.route(route);
        });
      });

      next();
    });

  });

};

exports.register.attributes = {
  pkg: require('./package.json')
};
