exports.get = {
  path: 'get',
  method: 'GET',
  handler(request, reply) {
    reply(request.pre.m1);
  }
};
