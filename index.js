'use strict';
const routeLoader = require('./lib/routeLoader');
const _ = require('lodash');

const defaults = {
  path: `${process.cwd()}/routes`,
  base: '/',
  verbose: false,
  autoLoad: true
};

exports.register = (server, options, next) => {
  const settings = _.clone(options);
  _.defaults(settings, defaults);
  settings.base = settings.base !== '' ? settings.base : defaults.base;
  routeLoader(server, settings, next, true);
};

exports.register.attributes = {
  pkg: require('./package.json')
};
