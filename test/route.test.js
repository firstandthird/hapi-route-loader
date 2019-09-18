/* eslint-disable no-undef*/
'use strict';
const Hapi = require('@hapi/hapi');
const routeLoader = require('../');
const tap = require('tap');

const setupServerPlugin = async (options, routes) => {
  const server = new Hapi.Server({ port: 8080 });
  await server.register({ plugin: routeLoader.plugin, options });
  routes.forEach((route) => {
    server.route(route);
  });
  await server.start();
  return server;
};

// 'hapi-route-loader base option omitted, undefined, blank, or does not exist':
tap.test(" base: '', path: '/dashboard' => '/dashboard'", async (t) => {
  const options = {
    base: '',
    path: `${__dirname}/routes`
  };
  const routes = [{
    method: 'GET',
    path: '/dashboard',
    handler: (launchRequest, h) => {
      return '/dashboard';
    }
  }];
  const server = new Hapi.Server({ port: 8080 });
  await server.register({ plugin: routeLoader.plugin, options });
  routes.forEach((route) => {
    server.route(route);
  });
  await server.start();
  const response = await server.inject({
    method: 'get',
    url: 'http://localhost:8080/dashboard'
  });
  t.equal(response.result, '/dashboard', '/dashboard as base');
  await server.stop();
  t.end();
});

tap.test(" base: '', path: '/trailingslash/' => '/trailingslash/'", async(t) => {
  const options = {
    base: '',
    path: `${__dirname}/routes`
  };
  const server = new Hapi.Server({ port: 8080 });
  await server.register({ plugin: routeLoader.plugin, options });
  await server.start();
  const response = await server.inject({
    method: 'get',
    url: 'http://localhost:8080/trailingslash/'
  });
  t.equal(response.result, '/trailingslash/', ' blank as base');
  await server.stop();
  t.end();
});

tap.test(" base: undefined, path: '/dashboard' => '/dashboard'", async (t) => {
  const options = {
    base: undefined,
    path: `${__dirname}/routes`
  };
  const server = await setupServerPlugin(options, [{
    method: 'GET',
    path: '/dashboard',
    handler: (launchRequest, reply) => {
      return '/dashboard';
    }
  }]);
  const response = await server.inject({
    method: 'get',
    url: 'http://localhost:8080/dashboard'
  });
  t.equal(response.result, '/dashboard', '/dashboard as base');
  await server.stop();
  t.end();
});

tap.test(" base omitted, path: '/dashboard' => '/dashboard'", async(t) => {
  const options = {
    path: `${__dirname}/routes`
  };
  const server = await setupServerPlugin(options, [{
    method: 'GET',
    path: '/dashboard',
    handler: (launchRequest, reply) => {
      return '/dashboard';
    }
  }]);
  const response = await server.inject({ url: 'http://localhost:8080/dashboard' });
  t.equal(response.result, '/dashboard', '/dashboard as base');
  await server.stop();
  t.end();
});

tap.test('base omitted, path does not exist', async(t) => {
  const options = {
    path: 'no/no/no/no/nuh/to/the/uh/to/the/no/no/no/'
  };
  const server = await setupServerPlugin(options, [{
    method: 'GET',
    path: '/dashboard',
    handler: (launchRequest, reply) => {
      return '/dashboard';
    }
  }]);
  const response = await server.inject({ url: 'http://localhost:8080/dashboard' });
  t.equal(response.result, '/dashboard', '/dashboard as base');
  await server.stop();
  t.end();
});

tap.test(" base: '', path: '/dashboard/' => '/dashboard/'", async(t) => {
  const options = {
    base: '',
    path: `${__dirname}/routes`
  };
  const server = await setupServerPlugin(options, [{
    method: 'GET',
    path: '/dashboard/',
    handler: (launchRequest, reply) => {
      return '/dashboard/';
    }
  }]);
  const response = await server.inject({ url: 'http://localhost:8080/dashboard/' });
  t.equal(response.result, '/dashboard/', '/dashboard/ as base');
  await server.stop();
  t.end();
});

// 'hapi-route-loader /dashboard base'
tap.test("base: '/dashboard', path: 'get' => '/dashboard/get'", async(t) => {
  const options = {
    path: `${__dirname}/routes`,
    base: '/dashboard'
  };
  const server = await setupServerPlugin(options, []);
  await server.start();
  const response = await server.inject({ url: 'http://localhost:8080/dashboard/get' });
  t.equal(response.result, '/get', 'dashboard/get works');
  await server.stop();
});

tap.test("base: '/dashboard', path: 'trailingslash/' => '/dashboard/trailingslash/' with trailing slash", async(t) => {
  const options = {
    path: `${__dirname}/routes`,
    base: '/dashboard'
  };
  const server = await setupServerPlugin(options, []);
  await server.start();
  const response = await server.inject({ url: 'http://localhost:8080/dashboard/trailingslash/' });
  t.equal(response.result, '/trailingslash/', 'dashboard/trailingslash/ works');
  await server.stop();
  t.end();
});

tap.test("base: '/dashboard', path: null => '/dashboard'", async(t) => {
  const options = {
    path: `${__dirname}/routes`,
    base: '/dashboard'
  };
  const server = await setupServerPlugin(options, []);
  await server.start();
  const response = await server.inject({ url: 'http://localhost:8080/dashboard' });
  t.equal(response.result, '/', '/dashboard as base');
  await server.stop();
  t.end();
});

tap.test("base: '/dashboard', path: '{id}' => '/dashboard/{id}'", async(t) => {
  const options = {
    path: `${__dirname}/routes`,
    base: '/dashboard'
  };
  const server = await setupServerPlugin(options, []);
  await server.start();
  const response = await server.inject({ url: 'http://localhost:8080/dashboard/testId' });
  t.equal(response.result, 'testId', 'param passed correctly');
  await server.stop();
  t.end();
});

// 'hapi-route-loader / base'
tap.test(" base: '/', path: '/dashboard' => '/dashboard'", async(t) => {
  const options = {
    base: '/',
    path: `${__dirname}/routes`
  };
  const server = await setupServerPlugin(options, [{
    method: 'GET',
    path: '/dashboard',
    handler: (launchRequest, reply) => {
      return '/dashboard';
    }
  }]);
  const response = await server.inject({ url: 'http://localhost:8080/dashboard' });
  t.equal(response.result, '/dashboard', '/ as base');
  await server.stop();
  t.end();
});

tap.test(" base: '/', path: '/trailingslash/' => '/trailingslash/'", async(t) => {
  const options = {
    base: '/',
    path: `${__dirname}/routes`
  };
  const server = await setupServerPlugin(options, [{
    method: 'GET',
    path: '/dashboard',
    handler: (launchRequest, reply) => {
      return '/dashboard';
    }
  }]);
  const response = await server.inject({ url: 'http://localhost:8080/trailingslash/' });
  t.equal(response.result, '/trailingslash/', '/dashboard as base');
  await server.stop();
  t.end();
});

tap.test('will preserve the config: pre: [] option for routes', async(t) => {
  const options = {
    base: '/',
    path: `${__dirname}/routes`
  };
  const server = await setupServerPlugin(options, [{
    method: 'GET',
    path: '/dashboard',
    handler: (launchRequest, reply) => {
      return '/dashboard';
    }
  }]);
  const response = await server.inject({ method: 'post', url: 'http://localhost:8080/' });
  t.equal(response.result, 'preProcessed', 'config.pre is preserved');
  await server.stop();
  t.end();
});

// 'hapi-route-loader can use function for config'
tap.test(" base: '/', path: '/get' => '/get'", async(t) => {
  const options = {
    functionTestThingy: 'thingy',
    base: '/',
    path: `${__dirname}/functionRoutes`
  };
  const server = await setupServerPlugin(options, []);
  await server.start();
  const response = await server.inject({ url: 'http://localhost:8080/get' });
  t.equal(response.result, `${server.version},${options.functionTestThingy}`, 'routeConfig accepts server/settings and returns config');
  await server.stop();
  t.end();
});

// 'hapi-route-loader /dashboard/ base'

tap.test("base: '/dashboard/', path: null => '/dashboard/'", async(t) => {
  const options = {
    path: `${__dirname}/routes`,
    base: '/dashboard/'
  };
  const server = await setupServerPlugin(options, []);
  await server.start();
  const response = await server.inject({ url: 'http://localhost:8080/dashboard/' });
  t.equal(response.result, '/', '/dashboard/ works');
  await server.stop();
  t.end();
});

tap.test("base: '/dashboard/', path: null => '/dashboard/'", async(t) => {
  const options = {
    path: `${__dirname}/routes`,
    base: '/dashboard/'
  };
  const server = await setupServerPlugin(options, []);
  await server.start();
  const response = await server.inject({ url: 'http://localhost:8080/dashboard/trailingslash/' });
  t.equal(response.result, '/trailingslash/', '/dashboard/trailingslash/ works');
  await server.stop();
  t.end();
});

tap.test("base: '/dashboard/', path: '/user' => '/user'", async(t) => {
  const options = {
    path: `${__dirname}/routes`,
    base: '/dashboard/'
  };
  const server = await setupServerPlugin(options, []);
  await server.start();
  const response = await server.inject({ url: 'http://localhost:8080/user' });
  t.equal(response.result, '/user', 'user works');
  await server.stop();
  t.end();
});

// 'hapi-route-loader /prefix as prefix'
tap.test("base: '', prefix: '/prefix', path: null => 'prefix'", async(t) => {
  const options = {
    path: `${__dirname}/routes`,
    verbose: true,
    prefix: '/prefix'
  };
  const server = await setupServerPlugin(options, []);
  await server.start();
  const response = await server.inject({ url: 'http://localhost:8080/prefix' });
  t.equal(response.result, '/', '/dashboard/ works');
  await server.stop();
  t.end();
});

tap.test("base: '', prefix: '/prefix', path: trailingslash/ => 'prefix/trailingslash/'", async(t) => {
  const options = {
    path: `${__dirname}/routes`,
    verbose: true,
    prefix: '/prefix'
  };
  const server = await setupServerPlugin(options, []);
  await server.start();
  const response = await server.inject({ url: 'http://localhost:8080/prefix/trailingslash/' });
  t.equal(response.result, '/trailingslash/', '/trailingslash/ works');
  await server.stop();
  t.end();
});

tap.test("base: undefined, prefix: '/prefix', path: '/user' => '/prefix/user'", async(t) => {
  const options = {
    path: `${__dirname}/routes`,
    verbose: true,
    prefix: '/prefix'
  };
  const server = await setupServerPlugin(options, []);
  await server.start();
  const response = await server.inject({ url: 'http://localhost:8080/prefix/user' });
  t.equal(response.result, '/user', 'user works');
  await server.stop();
  t.end();
});

// 'hapi-route-loader.routeLoader function will also load routes'
tap.test('works as an exported module method, base: /dashboard, path: get => /dashboard/get', async(t) => {
  const options = {
    path: `${__dirname}/routes`,
    base: '/dashboard'
  };
  const server = new Hapi.Server({ port: 8080 });
  await routeLoader.routeLoader(server, options);
  await server.start();
  const response = await server.inject({ url: 'http://localhost:8080/dashboard/get' });
  t.equal(response.result, '/get', 'dashboard/get works');
  await server.stop();
  t.end();
});

// 'hapi-route-loader lets you specify routeConfig object for all routes'
tap.test('base: /dashboard, path: get => /dashboard/get', async(t) => {
  // this will be assigned to all routes
  const pre1 = (request, reply) => {
    return 'global!';
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
  const server = await setupServerPlugin(options, []);
  await server.start();
  const response = await server.inject({ url: 'http://localhost:8080/dashboard/get' });
  t.equal(response.result, 'global!');
  await server.stop();
  t.end();
});

// 'hapi-route-loader deeply nested route'
tap.test(" file: '/routes/api/test/test.js' => '/api/test'", async(t) => {
  const options = {
    path: `${__dirname}/routes/`
  };
  const server = await setupServerPlugin(options, []);
  const response = await server.inject({ url: 'http://localhost:8080/api/test' });
  t.equal(response.result, '/nested', 'file /routes/api/test/test.js -> /api/test');
  await server.stop();
  t.end();
});
