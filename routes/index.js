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
    mixes.getRecentMixes(req, client, function(err, mixes) {
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
        res.status(500);
        res.json({ 'error': 'Invalid format' });
      } else {
        res.json({ mix: mix });
      }
    });
  });

  app.delete('/mix', function(req, res) {
    mixes.deleteMix(req, client, function(err, mix) {
      if (err) {
        res.status(500);
        res.json({ 'error': 'Could not delete' });
      } else {
        res.json({ message: 'deleted mix' });
      }
    });
  });

  // Logout
  app.post('/persona/logout', isLoggedIn, function(req, res) {
    req.session.reset();
    res.json({
      'message': 'logged out'
    });
  });
};