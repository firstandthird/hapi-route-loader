const chai = require('chai');
const assert = chai.assert;
const validateRoutesDirectory = require('../lib/validateRoutesDirectory');
const getRoutePathBase = require('../lib/getRoutePathBase');
const getCompletePath = require('../lib/getCompletePath');
const getRoutesFromFiles = require('../lib/getRoutesFromFiles');
const configureRoute = require('../lib/configureRoute');

describe('validateRoutesDirectory', () => {
  it('logs if a directory does not exist', (done) => {
    const server = {
      log(tags, msg) {
        assert(msg.message === 'path doesnt exist');
      }
    };
    const settings = {
      path: 'nonono'
    };
    validateRoutesDirectory(server, settings, (outcome) => {
      done();
    });
  });
  it('logs if a directory is actually a file', (done) => {
    const server = {
      log(tags, msg) {
        assert(msg.message === 'path not a directory');
      }
    };
    const settings = {
      path: __filename
    };
    validateRoutesDirectory(server, settings, (outcome) => {
      assert(outcome.indexOf('not a directory'));
      done();
    });
  });
  it('is fine with valid directories', (done) => {
    const server = {};
    const settings = {
      path: __dirname
    };
    validateRoutesDirectory(server, settings, (outcome) => {
      assert(outcome === undefined);
      done();
    });
  });
});

describe('getCompletePath ', () => {
  it('get route when originalPath starts with /', (done) => {
    const result = getCompletePath({}, 'routes/test/testerson.js', '/originalPath');
    assert(result === '/originalPath');
    done();
  });

  it('get route when originalPath does not start with /', (done) => {
    const result = getCompletePath({}, 'routes/test/testerson.js', 'originalPath');
    assert(result === '/routes/test/originalPath');
    done();
  });

  it('get route when originalPath ends with /', (done) => {
    const result = getCompletePath({}, 'routes/test/testerson.js', 'originalPath/');
    assert(result === '/routes/test/originalPath/');
    done();
  });
});

describe('getRoutePathBase', () => {
  it('turn a file path into the base of the route name', (done) => {
    const result = getRoutePathBase({}, 'routes/test/testerson.js');
    assert(result === '/routes/test');
    done();
  });

  it('appends the file base to the route name', (done) => {
    const result = getRoutePathBase({ base: 'base' }, 'routes/test/testerson.js');
    assert(result === 'base/routes/test');
    done();
  });
});

describe('getRoutesFromFiles', () => {
  it('gets routes from a file when provided as a module export:', (done) => {
    const settings = {
      path: `${__dirname}/routes`
    };
    const server = {
      value: 'hello world'
    };
    getRoutesFromFiles(server, settings, ['route.js'], (err, configuredRoutes) => {
      assert(err === null);
      assert(configuredRoutes.length === 8);
      configuredRoutes.forEach((route) => {
        assert(typeof route === 'object');
        assert(route.path !== undefined);
        assert(route.method !== undefined);
        assert(route.handler !== undefined);
      });
      done();
    });
  });
  it('gets routes from a file when provided as a function:', (done) => {
    const settings = {
      path: `${__dirname}/functionRoutes`,
      functionTestThingy: 'test'
    };
    const server = {
      version: 'hello world'
    };
    getRoutesFromFiles(server, settings, ['function.js'], (err, configuredRoutes) => {
      assert(err === null);
      assert(configuredRoutes.length === 1);
      const route = configuredRoutes[0];
      assert(typeof route === 'object');
      assert(route.path !== undefined);
      assert(route.method !== undefined);
      assert(route.handler !== undefined);
      route.handler({}, (value) => {
        assert.equal(value, `${server.version},${settings.functionTestThingy}`);
        done();
      });
    });
  });
});

describe('configureRoute', () => {
  it('configures a route from its definition', (done) => {
    const settings = {
      path: `${__dirname}/routes`,
      base: 'first',
      routeConfig: {
        strategy: 'none'
      }
    };
    const routeConfig = {
      path: 'crooked',
      method: 'also crooked',
      handler(request, reply) {
        return reply();
      }
    };
    const result = configureRoute(settings, 'route.js', routeConfig);
    assert(result.path === 'first/crooked');
    assert(result.config.strategy === 'none');
    done();
  });
});
