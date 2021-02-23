## hapi-route-loader [![Build Status](https://travis-ci.org/firstandthird/hapi-route-loader.svg?branch=master)](https://travis-ci.org/firstandthird/hapi-route-loader)

## What It Does
A hapi plugin that automatically loads routes from a
directory for your hapi server
(never type "server.route(...)" again!)

## Installation

In your main hapi directory do:

```console
npm install hapi-route-loader
```

## Directory Layout

You define routes in js files inside a nested directory structure in a
'routes' directory in your server project (file format will be
  explained below):
```
/routes
├── api
│   ├── foo.js/
│   ├── bar.js/
│   ├── baz.js/
│   ├── baz.js/
│   ├── bat/
│       ├── bif.js/
├── admin
│   ├── foo.js/
│   ├── bar.js/
├── login.js
├── logout.js
```

This will register the following routes with your server:

```
/api/foo
/api/bar
/api/baz
/api/bat/bif
/admin/foo
/admin/bar
/login
/logout
```

## File Format

Files contain the options passed to server.route

### Example 1:

/routes/api/myRoute.js:

```javascript
exports.test = {
  method: 'GET',
  handler(request, h) {
    return '<h1> Hello World </h1>';
  }
};
```

Creates a GET route handler at `/api/myRoute`

### Example 2:

/routes/api/myRoute.js:

```javascript
exports.test = {
  path: 'callMe',
  method: 'POST',
  handler(request, h) {
    return { value: request.query.value };
  }
};
```

Since the 'path' field is specified this creates a POST route at `/api/CallMe` instead of `/api/myRoute`

```
To register the plugin just do:

```javascript
const routeLoader = require('hapi-route-loader');
const server = new hapi.Server({ port: 8000 });
await server.register({ plugin: routeLoader.plugin, options });

```
 and this will then load the routes from the base directory

 ## Options (pass these to the plugin)

- __path___

  the path to the directory containing your route files, default is the `/routes`
directory in the current working directory (`process.cwd()`).  For example, setting
options.path to '/myRoutes' will look in `/myRoutes` instead.
- __base__

  the root path for all routes, by default this is '/' but you can override
   this.  For example if 'base' is `/api` and you have a route
specified at `/foo.js` it will be registered as `/api/foo` instead of `/foo`
- __prefix__

  works like base, except prefix will always be at the beginning of the path  
- __verbose__

  prints out verbose information about each route as it is registered, default is false
- __autoLoad__

  The route-loading function is exported by the library.  By default
  hapi-route-loader will load and register all routes when you register the plugin.
  Set autoLoad to false to skip this and manually use the exported function.
- __routeConfig__

    You can specify a base routeConfig for all routes, for example:
    ```javascript
    // this will be assigned to all routes
    const pre1 = (request, reply) => {
      return 'global!';
    };

    {
      routeConfig: {
        pre: [
           { method: pre1, assign: 'm1' },
        ]
      }
    }
    ```
    will result in each route having the indicated pre method
```
