exports.get = {
  method: 'GET',
  path: 'get',
  handler: function (request, reply) {
    reply('/get')
  }
};
exports.none = {
  method: 'GET',
  path: null,
  handler: function (request, reply) {
    reply('/');
  }
};
exports.param = {
  method: 'GET',
  path: '{id}',
  handler: function (request, reply) {
    reply('' + request.params.id);
  }
};
exports.user = {
  method: 'GET',
  path : "/user",
  handler : function(request,reply){
    reply("/user");
  }
};
