exports.get = function(server, settings) {
  return {
    method: 'GET',
    path: 'get',
    handler: function(request, reply) {
      reply(`${server.version},${settings.functionTestThingy}`);
    }
  };
};
