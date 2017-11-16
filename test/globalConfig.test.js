'use strict';
const Hapi = require('hapi');
const request = require('request');
const routeLoader = require('../').routeLoader;
const tap = require('tap');

tap.test('hapi-route-loader lets you specify routeConfig object for all routes', (t) => {
  let count = 0;
  const server = new Hapi.Server({ port: 8080 });
  const start = async () => {
    await server.start();
  };
  start();
  // this will be assigned to all routes
  const pre1 = (request) => {
    return 'global!';
  }
  const options = {
    base: '/dashboard',
    prefix: '/prefix',
    path: `${__dirname}/globalConfigRoutes`,
    // will merge with all route configs:
    routeConfig: {
      pre: [
         { method: pre1, assign: 'm1' },
      ]
    }
  };
  routeLoader(server, options, async() => {
    const response = await server.inject({
      method: 'get',
      url: 'http://localhost:8080/prefix/dashboard/get'
    });
    t.equal(response.result, 'global!');
    await server.stop();
    t.end();
  });
});
