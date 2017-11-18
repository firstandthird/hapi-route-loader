exports.get = {
  path: 'get',
  method: 'GET',
  handler(request, h) {
    return request.pre.m1;
  }
};
