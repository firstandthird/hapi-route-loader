const fs = require('fs');

const validateRoutesDirectory = (server, settings, done) => {
  fs.exists(settings.path, (exists) => {
    if (!exists) {
      server.log(['hapi-route-loader', 'warning'], { message: 'path doesnt exist', path: settings.path });
      return done();
    }
    fs.stat(settings.path, (err, stat) => {
      if (err) {
        return done(err);
      }
      if (!stat.isDirectory()) {
        server.log(['hapi-route-loader', 'warning'], { message: 'path not a directory', path: settings.path });
        return done(`path ${settings.path} not a directory`);
      }
      return done();
    });
  });
};

module.exports = validateRoutesDirectory;
