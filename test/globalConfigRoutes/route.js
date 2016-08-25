exports.get = {
  path: 'get',
  method: 'GET',
  handler: function (request, reply) {
    reply(request.pre.m1);
  }
};
