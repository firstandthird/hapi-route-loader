const getCompletePath = require('./getCompletePath');

module.exports = (settings, fileName, routeConfig) => {
  const finalRouteConfig = Object.assign({}, routeConfig);
  // set up the route's 'config' option:
  if (settings.routeConfig) {
    if (routeConfig.config) {
      finalRouteConfig.config = Object.assign({}, routeConfig.config, settings.routeConfig);
    } else {
      finalRouteConfig.config = settings.routeConfig;
    }
  }
  // set up the route's 'path' option:
  finalRouteConfig.path = getCompletePath(settings, fileName, routeConfig.path);
  return finalRouteConfig;
};
