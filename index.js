'use strict';

exports.routeLoader = require('./lib/routeLoader');

exports.register = (server, options, next) => {
  exports.routeLoader(server, options, next, true);
};

exports.register.attributes = {
  pkg: require('./package.json')
};
