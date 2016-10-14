'use strict';
const chai = require('chai');
const assert = chai.assert;
const request = require('request');
const setup = require('./setup.test.js');

describe('hapi-route-loader /dashboard base', () => {
  let server;
  const options = {
    path: `${__dirname}/routes`,
    base: '/dashboard'
  };
  beforeEach((done) => {
    setup.setupServerPlugin(options, [], (err, returnedServer) => {
      server = returnedServer;
      done();
    });
  });
  afterEach((done) => {
    server.stop(done);
  });
  it("base: '/dashboard', path: 'get' => '/dashboard/get'", (done) => {
    request.get('http://localhost:8080/dashboard/get', (err, response) => {
      assert(err === null);
      assert(response.body === '/get', 'dashboard/get works');
      done();
    });
  });
  it("base: '/dashboard', path: null => '/dashboard'", (done) => {
    request.get('http://localhost:8080/dashboard', (err, response) => {
      assert(err === null);
      assert(response.body === '/', '/dashboard as base');
      done();
    });
  });
  it("base: '/dashboard', path: '{id}' => '/dashboard/{id}'", (done) => {
    request.get('http://localhost:8080/dashboard/testId', (err, response) => {
      assert(err === null);
      assert(response.body === 'testId', 'param passed correctly');
      done();
    });
  });
});

describe('hapi-route-loader / base', () => {
  let server;
  const options = {
    base: '/',
    path: `${__dirname}/routes`
  };
  beforeEach((done) => {
    setup.setupServerPlugin(options, [{
      method: 'GET',
      path: '/dashboard',
      handler: (launchRequest, reply) => {
        reply('/dashboard');
      }
    }], (err, returnedServer) => {
      server = returnedServer;
      done();
    });
  });
  afterEach((done) => {
    server.stop(done);
  });
  afterEach((done) => {
    server.stop(done);
  });
  it(" base: '/', path: '/dashboard' => '/dashboard'", (done) => {
    request.get('http://localhost:8080/dashboard', (err, response) => {
      assert(err === null);
      assert(response.body === '/dashboard', '/dashboard as base');
      done();
    });
  });
  it("will preserve the config: pre: [] option for routes", (done) => {
    request.post('http://localhost:8080/', {}, (err, response) => {
      assert(err === null);
      assert(response.body === 'preProcessed', 'config.pre is preserved');
      done();
    });
  });
});

describe('hapi-route-loader /dashboard/ base', () => {
  let server;
  const options = {
    path: `${__dirname}/routes`,
    base: '/dashboard/'
  };
  beforeEach((done) => {
    setup.setupServerPlugin(options, [], (err, returnedServer) => {
      server = returnedServer;
      done();
    });
  });
  afterEach((done) => {
    server.stop(done);
  });
  it("base: '/dashboard/', path: null => '/dashboard/'", (done) => {
    request.get('http://localhost:8080/dashboard/', (err, response) => {
      assert(err === null);
      assert(response.body === '/', '/dashboard/ works');
      done();
    });
  });
  it("base: '/dashboard/', path: '/user' => '/user'", (done) => {
    request.get('http://localhost:8080/user', (err, response) => {
      assert(err === null);
      assert(response.body === '/user', 'user works');
      done();
    });
  });
});
