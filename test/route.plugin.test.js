'use strict'

// todo: rewrite this in lab
let chai = require('chai');
let assert = chai.assert;
let should = chai.should();
let Hapi = require('hapi');
let request = require('request');
let routeLoader = require('../');


let launchServer = function(server, port, options, done){
  options.path= __dirname + "/routes";
  server.connection({ port: port });
  server.register({
    register : routeLoader,
    options : options
  }, function(err, result){
    if (err)
      return done(err);
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
  let port = 8083;
  let options = {base:'/dashboard'};
  before(function(done){
    launchServer(server,port,options,done);
  });
  it("base: '/dashboard', path: 'get' => '/dashboard/get'", function(done){
    request.get('http://localhost:8083/dashboard/get', function(err,response){
      assert(response.body=="/get", 'dashboard/get works');
      done();
    });
  });
  it("base: '/dashboard', path: null => '/dashboard'", function(done){
    request.get('http://localhost:8083/dashboard', function(err,response){
      assert(response.body=="/", '/dashboard as base');
      done();
    });
  });
  it("base: '/dashboard', path: '{id}' => '/dashboard/{id}'", function(done){
    request.get('http://localhost:8083/dashboard/testId', function(err,response){
      assert(response.body=="testId", 'param passed correctly');
      done();
    });
  });
});

describe('hapi-route-loader / base', function(done){
  let server = new Hapi.Server();
  let port = 8084;
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
    request.get('http://localhost:8084/dashboard', function(err,response){
      assert(response.body=="/dashboard", '/dashboard as base');
      done();
    });
  });
});
describe('hapi-route-loader /dashboard/ base', function(done){
  let server = new Hapi.Server();
  let port = 8085;
  let options = {base:'/dashboard/'};
  before(function(done){
    launchServer(server,port,options,function(){
      done();
    });
  });
  it("base: '/dashboard/', path: null => '/dashboard/'", function(done){
    request.get('http://localhost:8085/dashboard/', function(err,response){
      assert(response.body=="/", '/dashboard/ works');
      done();
    });
  });
  it("base: '/dashboard/', path: '/user' => '/user'", function(done){
    request.get('http://localhost:8085/user', function(err,response){
      assert(response.body=="/user", 'user works');
      done();
    });
  });
});