const Hapi = require('hapi');
const routeLoader = require('../').routeLoader;

module.exports.setupServerPlugin = (options, routes, callback) => {
  const server = new Hapi.Server({});
  server.connection({ port: 8080 });
  server.register({
    register: routeLoader,
    options
  }, (err) => {
    server.start((err2) => {
      if (err2) {
        console.log(err2)
      }
      routes.forEach((route) => {
        server.route(route);
      });
      callback(err, server);
    });
  });
};

module.exports.setupServerModule = (options, routes, callback) => {
  const server = new Hapi.Server({});
  server.connection({ port: 8080 });
  routeLoader(server, options, (err) => {
    if (err) {
      return done(err);
    }
    server.start((err2) => {
      if (err2) {
        console.log(err2)
      }
      routes.forEach((route) => {
        server.route(route);
      });
      callback(err, server);
    });
  });
};
