'use strict'
let chai = require('chai');
let assert = chai.assert;
let should = chai.should();
let Hapi = require('hapi');
let request = require('request');

let launchServer = function(server, port, options, done){
  options.path= __dirname + "/routes";
  server.connection({ port: port });
  server.register([{
    register: require('../'),
    options :  options,
  }
  ], function (err) {
    if (err) {
      console.error('Failed to load plugin:', err);
      return done(err);
    }
    server.start(function(err){
      if (err){
        console.log(err)
        return done(err);
      }
      done();
    });
  });
}


describe('hapi-route-loader /dashboard base', function(done){
  let server = new Hapi.Server();
  let port = 8080;
  let options = {base:'/dashboard'};
  before(function(done){
    launchServer(server,port,options,done);
  });
  it("base: '/dashboard', path: 'get' => '/dashboard/get'", function(done){
    request.get('http://localhost:8080/dashboard/get', function(err,response){
      assert(response.body=="/get", 'dashboard/get works');
      done();
    });
  });
  it("base: '/dashboard', path: null => '/dashboard'", function(done){
    request.get('http://localhost:8080/dashboard', function(err,response){
      assert(response.body=="/", '/dashboard as base');
      done();
    });
  });
  it("base: '/dashboard', path: '{id}' => '/dashboard/{id}'", function(done){
    request.get('http://localhost:8080/dashboard/testId', function(err,response){
      assert(response.body=="testId", 'param passed correctly');
      done();
    });
  });
});

describe('hapi-route-loader / base', function(done){
  let server = new Hapi.Server();
  let port = 8081;
  let options = {base:'/'};
  before(function(done){
    launchServer(server,port,options,function(){
      server.route({
        method: 'GET',
        path: '/dashboard',
        handler: function (request, reply) {
          reply('/dashboard')
        }
      });
      done();
    });
  });
  it(" base: '/', path: '/dashboard' => '/dashboard'", function(done){
    request.get('http://localhost:8081/dashboard', function(err,response){
      assert(response.body=="/dashboard", '/dashboard as base');
      done();
    });
  });
});
describe('hapi-route-loader /dashboard/ base', function(done){
  let server = new Hapi.Server();
  let port = 8082;
  let options = {base:'/dashboard/'};
  before(function(done){
    launchServer(server,port,options,function(){
      done();
    });
  });
  it("base: '/dashboard/', path: null => '/dashboard/'", function(done){
    request.get('http://localhost:8082/dashboard/', function(err,response){
      assert(response.body=="/", '/dashboard/ works');
      done();
    });
  });
  it("base: '/dashboard/', path: '/user' => '/user'", function(done){
    request.get('http://localhost:8082/user', function(err,response){
      assert(response.body=="/user", 'user works');
      done();
    });
  });
});
