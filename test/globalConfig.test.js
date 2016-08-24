'use strict';
const chai = require('chai');
const assert = chai.assert;
const Hapi = require('hapi');
const request = require('request');
const routeLoader = require('../').routeLoader;

const launchServer = function(server, port, options, done) {
  options.path = `${__dirname}/globalConfigRoutes`;
  server.connection({ port });
  routeLoader(server, options, (err) => {
    if (err) {
      return done(err);
    }
    server.start((startErr) => {
      if (startErr) {
        console.log(startErr);
        return done(startErr);
      }
      done();
    });
  });
};

describe('hapi-route-loader lets you specify globalConfig object for all routes', () => {
  let count = 0;
  const server = new Hapi.Server();
  const port = 8080;
  // this will be assigned to all routes
  const pre1 = (request, reply) => {
    return reply('global!');
  }
  const options = {
    base: '/dashboard',
    // will merge with all route configs:
    globalConfig: {
      pre: [
         { method: pre1, assign: 'm1' },
      ]
    }
  };
  before((done) => {
    launchServer(server, port, options, done);
  });
  after((done) => {
    server.stop(() => {
      done();
    });
  });
  it('base: /dashboard, path: get => /dashboard/get', (done) => {
    request.get('http://localhost:8080/dashboard/get', (err, response) => {
      assert(err === null);
      console.log(response.body)
      // assert(response.body === 'global!');
      done();
    });
  });
});
