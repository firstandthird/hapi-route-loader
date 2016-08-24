'use strict';
const chai = require('chai');
const assert = chai.assert;
const Hapi = require('hapi');
const request = require('request');
const routeLoader = require('../');

const launchServer = (server, port, options, done) => {
  options.path = `${__dirname}/routes`;
  server.connection({ port });
  server.register({
    register: routeLoader,
    options
  }, (err) => {
    assert(err === undefined);
    server.start((startErr) => {
      if (startErr) {
        console.log(startErr);
        return done(startErr);
      }
      done();
    });
  });
};

describe('hapi-route-loader /dashboard base', () => {
  const server = new Hapi.Server();
  const port = 8083;
  const options = { base: '/dashboard' };
  before((done) => {
    launchServer(server, port, options, done);
  });
  it("base: '/dashboard', path: 'get' => '/dashboard/get'", (done) => {
    request.get('http://localhost:8083/dashboard/get', (err, response) => {
      assert(err === null);
      assert(response.body === '/get', 'dashboard/get works');
      done();
    });
  });
  it("base: '/dashboard', path: null => '/dashboard'", (done) => {
    request.get('http://localhost:8083/dashboard', (err, response) => {
      assert(err === null);
      assert(response.body === '/', '/dashboard as base');
      done();
    });
  });
  it("base: '/dashboard', path: '{id}' => '/dashboard/{id}'", (done) => {
    request.get('http://localhost:8083/dashboard/testId', (err, response) => {
      assert(err === null);
      assert(response.body === 'testId', 'param passed correctly');
      done();
    });
  });
});

describe('hapi-route-loader / base', () => {
  const server = new Hapi.Server();
  const port = 8084;
  const options = { base: '/' };
  before((done) => {
    launchServer(server, port, options, () => {
      server.route({
        method: 'GET',
        path: '/dashboard',
        handler: (launchRequest, reply) => {
          reply('/dashboard');
        }
      });
      done();
    });
  });
  it(" base: '/', path: '/dashboard' => '/dashboard'", (done) => {
    request.get('http://localhost:8084/dashboard', (err, response) => {
      assert(err === null);
      assert(response.body === '/dashboard', '/dashboard as base');
      done();
    });
  });
  it("will preserve the config: pre: [] option for routes", (done) => {
    request.post('http://localhost:8084/', {}, (err, response) => {
      assert(err === null);
      assert(response.body === 'preProcessed', 'config.pre is preserved');
      done();
    });
  });
});
describe('hapi-route-loader /dashboard/ base', () => {
  const server = new Hapi.Server();
  const port = 8085;
  const options = { base: '/dashboard/' };
  before((beforeDone) => {
    launchServer(server, port, options, () => {
      beforeDone();
    });
  });
  it("base: '/dashboard/', path: null => '/dashboard/'", (done) => {
    request.get('http://localhost:8085/dashboard/', (err, response) => {
      assert(err === null);
      assert(response.body === '/', '/dashboard/ works');
      done();
    });
  });
  it("base: '/dashboard/', path: '/user' => '/user'", (done) => {
    request.get('http://localhost:8085/user', (err, response) => {
      assert(err === null);
      assert(response.body === '/user', 'user works');
      done();
    });
  });
});
