exports.user = {
  method: 'GET',
  path : "user",
  handler : function(request,reply){
    reply("/api/user");
  }
};
