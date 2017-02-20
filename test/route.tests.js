'use strict';
const chai = require('chai');
const assert = chai.assert;
const request = require('request');
const Hapi = require('hapi');
const routeLoader = require('../');

const setupServerPlugin = (options, routes, callback) => {
  const server = new Hapi.Server({});
  server.connection({ port: 8080 });
  server.register({
    register: routeLoader,
    options
  }, (err) => {
    if (err) {
      console.log(err);
    }
    server.start((err2) => {
      if (err2) {
        throw err2;
      }
      routes.forEach((route) => {
        server.route(route);
      });
      callback(server);
    });
  });
};
describe('hapi-route-loader base option omitted, undefined, or blank', () => {
  let server;
  it(" base: '', path: '/dashboard' => '/dashboard'", (done) => {
    const options = {
      base: '',
      path: `${__dirname}/routes`
    };
    setupServerPlugin(options, [{
      method: 'GET',
      path: '/dashboard',
      handler: (launchRequest, reply) => {
        reply('/dashboard');
      }
    }], (returnedServer) => {
      server = returnedServer;
      request.get('http://localhost:8080/dashboard', (err, response) => {
        assert(err === null);
        assert(response.body === '/dashboard', '/dashboard as base');
        server.stop(done);
      });
    });
  });

  it(" base: undefined, path: '/dashboard' => '/dashboard'", (done) => {
    const options = {
      base: undefined,
      path: `${__dirname}/routes`
    };
    setupServerPlugin(options, [{
      method: 'GET',
      path: '/dashboard',
      handler: (launchRequest, reply) => {
        reply('/dashboard');
      }
    }], (returnedServer) => {
      server = returnedServer;
      request.get('http://localhost:8080/dashboard', (err, response) => {
        assert(err === null);
        assert(response.body === '/dashboard', '/dashboard as base');
        server.stop(done);
      });
    });
  });

  it(" base omitted, path: '/dashboard' => '/dashboard'", (done) => {
    const options = {
      path: `${__dirname}/routes`
    };
    setupServerPlugin(options, [{
      method: 'GET',
      path: '/dashboard',
      handler: (launchRequest, reply) => {
        reply('/dashboard');
      }
    }], (returnedServer) => {
      server = returnedServer;
      request.get('http://localhost:8080/dashboard', (err, response) => {
        assert(err === null);
        assert(response.body === '/dashboard', '/dashboard as base');
        server.stop(done);
      });
    });
  });
});

describe('hapi-route-loader /dashboard base', () => {
  let server;
  const options = {
    path: `${__dirname}/routes`,
    base: '/dashboard'
  };
  before((done) => {
    setupServerPlugin(options, [], (returnedServer) => {
      server = returnedServer;
      done();
    });
  });
  after((done) => {
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
    setupServerPlugin(options, [{
      method: 'GET',
      path: '/dashboard',
      handler: (launchRequest, reply) => {
        reply('/dashboard');
      }
    }], (returnedServer) => {
      server = returnedServer;
      done();
    });
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
  it('will preserve the config: pre: [] option for routes', (done) => {
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
    setupServerPlugin(options, [], (returnedServer) => {
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

describe('hapi-route-loader.routeLoader function will also load routes', () => {
  let server;
  const options = {
    path: `${__dirname}/routes`,
    base: '/dashboard'
  };
  beforeEach((done) => {
    server = new Hapi.Server({});
    server.connection({ port: 8080 });
    routeLoader.routeLoader(server, options, (err) => {
      if (err) {
        return done(err);
      }
      server.start((err2) => {
        if (err2) {
          throw err2;
        }
        done(err, server);
      });
    });
  });
  afterEach((done) => {
    server.stop(done);
  });

  it('works as an exported module method, base: /dashboard, path: get => /dashboard/get', (done) => {
    request.get('http://localhost:8080/dashboard/get', (err, response) => {
      assert(err === null);
      assert(response.body === '/get', 'dashboard/get works');
      done();
    });
  });
});

describe('hapi-route-loader lets you specify routeConfig object for all routes', () => {
  let server;
  // this will be assigned to all routes
  const pre1 = (request, reply) => {
    return reply('global!');
  };
  const options = {
    path: `${__dirname}/globalConfigRoutes`,
    base: '/dashboard',
    routeConfig: {
      pre: [
         { method: pre1, assign: 'm1' },
      ]
    }
  };

  beforeEach((done) => {
    setupServerPlugin(options, [], (returnedServer) => {
      server = returnedServer;
      done();
    });
  });
  afterEach((done) => {
    server.stop(done);
  });
  it('base: /dashboard, path: get => /dashboard/get', (done) => {
    request.get('http://localhost:8080/dashboard/get', (err, response) => {
      assert(err === null);
      assert(response.body === 'global!');
      done();
    });
  });
});

describe('hapi-route-loader deeply nested route', () => {
  let server;
  it(" file: '/routes/api/test/test.js' => '/api/test'", (done) => {
    const options = {
      path: `${__dirname}/routes/`
    };
    setupServerPlugin(options, [], (returnedServer) => {
      server = returnedServer;
      request.get('http://localhost:8080/api/test', (err, response) => {
        assert(err === null);
        assert(response.body === '/nested', 'file /routes/api/test/test.js -> /api/test');
        server.stop(done);
      });
    });
  });
});
