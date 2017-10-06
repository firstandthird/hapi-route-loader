const fs = require('fs');
const glob = require('glob');
const async = require('async');
const defaults = require('./defaults');
const validateRoutesDirectory = require('./validateRoutesDirectory');
const getRoutesFromFiles = require('./getRoutesFromFiles');

module.exports = (server, options, next) => {
  const load = (loadOptions, loadDone) => {
    const stub = () => {};
    loadDone = loadDone || stub;
    const settings = Object.assign({}, defaults, loadOptions);
    // the main flow is here:
    async.autoInject({
      // confirm that settings.path exists and is a directory:
      confirmDirectoryExists(done) {
        validateRoutesDirectory(server, settings, done);
      },
      // get the list of all matching route-containing files
      files(confirmDirectoryExists, done) {
        glob('**/*.js', {
          cwd: settings.path
        }, done);
      },
      configuredRoutes(files, done) {
        getRoutesFromFiles(server, settings, files, done);
      },
      // register all routes with server.route:
      registerAllRoutes: (configuredRoutes, done) => {
        configuredRoutes.forEach((routeConfig) => {
          if (options.verbose) {
            server.log(['debug', 'hapi-route-loader'], { msg: 'registering', data: routeConfig });
          }
          server.route(routeConfig);
        });
        done();
      }
    }, loadDone);
  };
  if (options.autoLoad === false) {
    return next();
  }
  load(options, next);
};
