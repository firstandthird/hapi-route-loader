exports.get = function(server, settings) {
  return {
    method: 'GET',
    path: 'get',
    handler(request, h) {
      return `${server.version},${settings.functionTestThingy}`;
    }
  };
};
