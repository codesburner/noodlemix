'use strict';

module.exports = function(app, client, isLoggedIn) {
  var mixes = require('../lib/mixes');
  var tags = require('../lib/tags');

  app.get('/', function(req, res) {
    if (req.session.email) {
      tags.cleanUp(req, client);
    }
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

  app.post('/mix', function(req, res) {
    mixes.addMix(req, client, function(err, mix) {
      if (err) {
        res.status(500);
        res.json({ 'error': err.message });
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

  app.get('/edit/:id', function(req, res) {
    mixes.getMix(req, req.params.id, client, function(err, mix) {
      if (err) {
        res.redirect('/500');
      } else {
        res.render('edit', {
          pageType: 'edit',
          mix: mix,
          session: req.session
        });
      }
    });
  });

  app.post('/tag', function(req, res) {
    tags.addTag(req, client, function(err, tag) {
      if (err) {
        res.status(500);
        res.json({ 'error': err.message });
      } else {
        res.json({ tag: tag });
      }
    });
  });

  app.post('/tracklist', function(req, res) {
    tags.addTagsByTracklist(req, client, function(tags) {
      console.log(tags)
      res.json({ tags: tags });
    });
  });

  app.get('/tags/:title', function(req, res) {
    tags.getTagsByMix(req, client, function(err, tags) {
      if (err) {
        res.status(500);
        res.json({ 'error': err.message });
      } else {
        res.json({ tags: tags });
      }
    });
  });

  app.delete('/tag', function(req, res) {
    tags.deleteTag(req, client, function(err, tag) {
      if (err) {
        res.status(500);
        res.json({ 'error': 'Could not delete' });
      } else {
        res.json({ message: 'deleted tag' });
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