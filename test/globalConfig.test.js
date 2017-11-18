'use strict';
const Hapi = require('hapi');
const routeLoader = require('../').routeLoader;
const tap = require('tap');

tap.test('hapi-route-loader lets you specify routeConfig object for all routes', async(t) => {
  let count = 0;
  const server = new Hapi.Server({ port: 8080 });
  await server.start();
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
  await routeLoader(server, options);
  const response = await server.inject({
    method: 'get',
    url: 'http://localhost:8080/prefix/dashboard/get'
  });
  t.equal(response.result, 'global!');
  await server.stop();
  t.end();
});
