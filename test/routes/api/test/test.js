exports.test = {
  method: 'GET',
  handler: function (request, reply) {
    reply('/nested');
  }
};
