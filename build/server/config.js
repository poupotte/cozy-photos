// Generated by CoffeeScript 1.9.0
var File, RealtimeAdapter, americano, fs, init, localizationManager, path, publicStatic, sharing, staticMiddleware, thumb, useBuildView;

americano = require('americano');

sharing = require('./controllers/sharing');

path = require('path');

fs = require('fs');

localizationManager = require('./helpers/localization_manager');

RealtimeAdapter = require('cozy-realtime-adapter');

init = require('./helpers/initializer');

thumb = require('./helpers/thumb').create;

File = require('./models/file');

path = require('path');

staticMiddleware = americano["static"](__dirname + '/../client/public', {
  maxAge: 86400000
});

publicStatic = function(req, res, next) {
  var url;
  url = req.url;
  req.url = req.url.replace('/public', '');
  return staticMiddleware(req, res, function(err) {
    req.url = url;
    return next(err);
  });
};

useBuildView = fs.existsSync(path.resolve(__dirname, 'views/index.js'));

module.exports = {
  common: {
    set: {
      'view engine': useBuildView ? 'js' : 'jade',
      'views': path.resolve(__dirname, 'views')
    },
    engine: {
      js: function(path, locales, callback) {
        return callback(null, require(path)(locales));
      }
    },
    use: [americano.methodOverride(), americano.bodyParser(), staticMiddleware, publicStatic, sharing.markPublicRequests],
    useAfter: [
      americano.errorHandler({
        dumpExceptions: true,
        showStack: true
      })
    ],
    afterStart: function(app, server) {
      var err, patterns, realtime, viewEngine;
      app.server = server;
      require('./controllers/photo').setApp(app);
      viewEngine = app.render.bind(app);
      localizationManager.setRenderer(viewEngine);
      try {
        fs.mkdirSync(path.join(__dirname, 'uploads'));
      } catch (_error) {
        err = _error;
        if (err.code !== 'EEXIST') {
          console.log("Something went wrong while creating uploads folder");
          console.log(err);
        }
      }
      patterns = ['contact.*', 'album.*', 'photo.*'];
      return realtime = RealtimeAdapter(server, patterns);
    }
  },
  development: [americano.logger('dev')],
  production: [americano.logger('short')],
  plugins: ['cozydb']
};
