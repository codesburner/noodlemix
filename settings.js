// Module dependencies.
module.exports = function(app, configurations, express) {
  var clientSessions = require('client-sessions');
  var nconf = require('nconf');
  var requirejs = require('requirejs');

  nconf.argv().env().file({ file: 'local.json' });

  // Configuration

  app.configure(function(){
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.set('view options', { layout: false });
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    if (!process.env.NODE_ENV) {
      app.use(express.logger('dev'));
      app.use(express.static(__dirname + '/public'));
    } else {
      app.use(express.static(__dirname + '/public_build'));
    }
    app.use(clientSessions({
      cookieName: nconf.get('session_cookie'),
      secret: nconf.get('session_secret'), // MUST be set
      // true session duration:
      // will expire after duration (ms)
      // from last session.reset() or
      // initial cookieing.
      duration: 24 * 60 * 60 * 1000 * 28 // 4 weeks
    }));
    app.use(app.router);
  });

  app.configure('development, test', function(){
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
  });

  app.configure('prod', function(){
    app.use(express.errorHandler());

    requirejs.optimize({
      appDir: 'public/',
      baseUrl: 'javascripts/',
      enforceDefine: true,
      dir: "public_build",
      modules: [
        {
          name: 'main'
        }
      ]
    }, function() {
      console.log('Successfully optimized javascript');
    });
  });

  return app;
};
