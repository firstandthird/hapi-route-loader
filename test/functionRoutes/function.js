exports.get = function() {
  return {
    method: 'GET',
    path: 'get',
    handler: function(request, reply) {
      reply('/get');
    }
  };
};
