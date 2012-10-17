'use strict';

module.exports = function(app, client, isLoggedIn) {
  var mixes = require('../lib/mixes');

  app.get('/', function(req, res) {
    res.render('index', {
      pageType: 'index',
      session: req.session
    });
  });

  app.get('/recent', function(req, res) {
    mixes.getRecentMixes(client, function(err, mixes) {
      if (err) {
        res.status(500);
        res.json({ 'error': 'Could not retrieve mixes' });
      } else {
        res.json({ mixes: mixes });
      }
    });
  });

  app.post('/add', function(req, res) {
    mixes.addMix(req, client, function(err, mix) {
      if (err) {
        res.json({ 'error': 'Invalid format' });
      } else {
        res.json({ mix: mix });
      }
    });
  });
};