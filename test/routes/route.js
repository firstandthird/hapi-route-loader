exports.get = {
  method: 'GET',
  path: 'get',
  handler(request, h) {
    return '/get';
  }
};
exports.trailingslash = {
  method: 'GET',
  path: 'trailingslash/',
  handler(request, h) {
    return '/trailingslash/';
  }
};
exports.none = {
  method: 'GET',
  path: null,
  handler(request, h) {
    return '/';
  }
};
exports.nonePost = {
  method: 'POST',
  path: null,
  config: {
    pre: [{
      method(request, h) {
        return 'preProcessed';
      },
      assign: 'result'
    }]
  },
  handler(request, h) {
    return request.pre.result;
  }
};

exports.param = {
  method: 'GET',
  path: '{id}',
  handler(request, h) {
    return request.params.id;
  }
};
exports.user = {
  method: 'GET',
  path: '/user',
  handler(request, h) {
    return '/user';
  }
};

exports.vhostRoutes = {
  method: 'GET',
  path: '/',
  vhost: ['site.dev', 'site.com'],
  handler(request, h) {
    return 'hello';
  }
};

exports.vhostRoutes2 = {
  method: 'GET',
  path: '/',
  vhost: ['notasite.dev', 'notasite.com'],
  handler(request, h) {
    return 'goodbye';
  }
};
