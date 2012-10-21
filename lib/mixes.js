'use strict';

/* Mix format
 * mix:mix_name_<timestamp>:
 *    id: <shortened title>
 *    author: <email>
 *    artist: <artist>
 *    title: <real title>
 *    releaseDate: <release date>
 *    totalTime: <total time>
 */

var utils = require('./utils');
var gravatar = require('gravatar');

var MIX_LIMIT = 19;

exports.getMix = function(req, mixName, client, callback) {
  client.hgetall('mix:' + mixName, function(err, mix) {
    if (err) {
      callback(err);
    } else {
      if (mix) {
        var isDeletable = false;
        var isEditable = false;

        // Only authors can delete
        if (req.session.email === mix.author) {
          isDeletable = true;
        }

        // Anyone logged in can edit
        if (req.session.email) {
          isEditable = true;
        }

        mix.isDeletable = isDeletable;
        mix.isEditable = isEditable;
      }
      callback(null, mix);
    }
  });
};

exports.getRecentMixes = function(req, client, callback) {
  var self = this;

  client.lrange('mixes', 0, MIX_LIMIT + 1, function(err, mixes) {
    if (err) {
      callback(err);
    } else {
      var mixList = [];

      if (mixes.length > 0) {
        mixes.forEach(function(mix, idx) {
          self.getMix(req, mix, client, function(err, mix) {
            if (err) {
              callback(err);
            } else {
              if (mix) {
                mixList.push(mix);
              }
            }

            if (idx === mixes.length - 1) {
              callback(null, mixList);
            }
          });
        });
      } else {
        callback(null, mixList);
      }
    }
  });
};

exports.addMix = function(req, client, callback) {
  var title = utils.setTitle(req.body.artist + '-' + req.body.title);
  var realTitle = req.body.title.trim();
  var self = this;

  if (realTitle.length < 1 || req.body.artist.trim().length < 1) {
    callback(new Error('Cannot be blank'));
  } else {
    this.getMix(req, title, client, function(err, mix) {
      if (err) {
        callback(new Error('Could not add mix'));
      } else {
        if (mix) {
          callback(new Error('This mix already exists'));
        } else {
          // Add to the mixes list
          client.lpush('mixes', title);
          client.ltrim('mixes', 0, MIX_LIMIT);

          // Create the mix hash
          client.hset('mix:' + title, 'id', title);
          client.hset('mix:' + title, 'author', req.session.email);
          client.hset('mix:' + title, 'gravatar', gravatar.url(req.session.email));
          client.hset('mix:' + title, 'artist', req.body.artist);
          client.hset('mix:' + title, 'title', realTitle);
          client.hset('mix:' + title, 'releaseDate', req.body.release_date);
          client.hset('mix:' + title, 'totalTime', req.body.total_time);

          self.getMix(req, title, client, function(err, mix) {
            if (err) {
              callback(err);
            } else {
              callback(null, mix);
            }
          });
        }
      }
    });
  }
};

exports.deleteMix = function(req, client, callback) {
  this.getMix(req, req.body.title, client, function(err, mix) {
    if (err) {
      callback(err);
    } else {
      if (req.session.email !== mix.author) {
        callback(new Error('You are not the author of this mix'));
      } else {
        // Delete mix
        client.del('mix:' + req.body.title);

        // Delete tags
        client.smembers('trackset:' + req.body.title, function(err, tags) {
          if (tags.length > 0) {
            tags.forEach(function(tag) {
              console.log(tag)
              client.del('tag:' + tag);
            });
          }
        });

        // Delete trackset
        client.del('trackset:' + req.body.title);

        client.lrange('mixes', 0, MIX_LIMIT + 1, function(err, mixes) {
          if (err) {
            callback(err);
          } else {
            mixes.forEach(function(mix, idx) {
              if (mix === req.body.title) {
                client.lrem('mixes', 0, mix);
              }
            });
            callback(null, true);
          }
        });
      }
    }
  });
};

exports.updateMix = function(req, client, callback) {
  client.hset('mix' + req.body.mix_name, 'releaseDate', req.body.release_date);
  client.hset('mix' + req.body.mix_name, 'totalTime', req.body.total_time);

  this.getMix(req, req.body.mix_name, client, function(err, mix) {
    if (err) {
      callback(err);
    } else {
      callback(null, mix);
    }
  });
};
