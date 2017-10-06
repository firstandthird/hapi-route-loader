'use strict';
const path = require('path');
const configureRoute = require('./configureRoute');

module.exports = (server, settings, files, done) => {
  const configuredRoutes = [];
  files.forEach((fileName) => {
    const moduleRoutes = require(path.join(settings.path, fileName));
    Object.keys(moduleRoutes).forEach((originalRouteConfigKey) => {
      let originalRouteConfig = moduleRoutes[originalRouteConfigKey];
      if (typeof originalRouteConfig === 'function') {
        originalRouteConfig = originalRouteConfig(server, settings);
      }
      configuredRoutes.push(configureRoute(settings, fileName, originalRouteConfig));
    });
  });
  return done(null, configuredRoutes);
};
