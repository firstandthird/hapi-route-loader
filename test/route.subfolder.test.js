'use strict';
const chai = require('chai');
const assert = chai.assert;
const Hapi = require('hapi');
const request = require('request');
const routeLoader = require('../').routeLoader;

const launchServer = function(server, port, options, done) {
  options.path = `${__dirname}/routes`;
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

describe('hapi-route-loader subfolder extension', () => {
  const serv = new Hapi.Server();
  const prt = 8087;
  const opts = { base: '/frank/', verbose: true };

  before((done) => {
    launchServer(serv, prt, opts, () => {
      done();
    });
  });
  after((done) => {
    serv.stop(() => {
      done();
    });
  });

  it('base: "/", path: "", subfolder: "item/" => "/item"', (done) => {
    request.get('http://localhost:8087/frank/item', (err, response) => {
      assert(err === null);
      assert(response.body === 'item/index', 'Subfolder extension Error');
      done();
    });
  });
});
