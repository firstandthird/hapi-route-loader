'use strict';
const chai = require('chai');
const assert = chai.assert;
const Hapi = require('hapi');
const request = require('request');
const mod = require('../index.js');

const launchServer = (server, port, options, done) => {
  options.path = `${__dirname}/routes`;
  server.connection({ port });
  server.register([{
    register: mod,
    options
  }
], (err) => {
    if (err) {
      console.error('Failed to load plugin:', err);
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

describe('hapi-route-loader /dashboard base', () => {
  const server = new Hapi.Server();
  const port = 8080;
  const options = { base: '/dashboard' };
  before((beforeDone) => {
    launchServer(server, port, options, beforeDone);
  });
  it('base: "/dashboard", path: "get" => "/dashboard/get"', (done) => {
    request.get('http://localhost:8080/dashboard/get', (err, response) => {
      assert(response.body === '/get', 'dashboard/get works');
      done();
    });
  });
  it('base: "/dashboard", path: null => "/dashboard"', (done) => {
    request.get('http://localhost:8080/dashboard', (err, response) => {
      assert(response.body === '/', '/dashboard as base');
      done();
    });
  });
  it('base: "/dashboard", path: "{id}" => "/dashboard/{id}"', (done) => {
    request.get('http://localhost:8080/dashboard/testId', (err, response) => {
      assert(response.body === 'testId', 'param passed correctly');
      done();
    });
  });
});

describe('hapi-route-loader / base', () => {
  const server = new Hapi.Server();
  const port = 8081;
  const options = { base: '/' };
  before((done) => {
    launchServer(server, port, options, () => {
      server.route({
        method: 'GET',
        path: '/dashboard',
        handler: (req, reply) => {
          reply('/dashboard');
        }
      });
      done();
    });
  });
  it(' base: "/", path: "/dashboard" => "/dashboard"', (done) => {
    request.get('http://localhost:8081/dashboard', (err, response) => {
      assert(response.body === '/dashboard', '/dashboard as base');
      done();
    });
  });
});
describe('hapi-route-loader /dashboard/ base', () => {
  const server = new Hapi.Server();
  const port = 8082;
  const options = { base: '/dashboard/' };
  before((done) => {
    launchServer(server, port, options, () => {
      done();
    });
  });
  it('base: "/dashboard/", path: null => "/dashboard/"', (done) => {
    request.get('http://localhost:8082/dashboard/', (err, response) => {
      assert(response.body === '/', '/dashboard/ works');
      done();
    });
  });
  it('base: "/dashboard/", path: "/user" => "/user"', (done) => {
    request.get('http://localhost:8082/user', (err, response) => {
      assert(response.body === '/user', 'user works');
      done();
    });
  });
});
