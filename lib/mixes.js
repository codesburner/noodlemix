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

var MIX_LIMIT = 19;

exports.getMix = function(mixName, client, callback) {
  client.hgetall('mix:' + mixName, function(err, mix) {
    if (err) {
      callback(err);
    } else {
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
          self.getMix(mix, client, function(err, mix) {
            if (err) {
              callback(err);
            } else {
              if (mix) {
                var isDeletable = false;

                if (req.session.email === mix.author) {
                  isDeletable = true;
                }

                mix.isDeletable = isDeletable;
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
  var title = utils.setTitle(req.body.title);
  var realTitle = req.body.title.trim();

  if (realTitle.length < 1 || req.body.artist.trim().length < 1) {
    callback(new Error('Cannot be blank'));
  } else {
    // Add to the mixes list
    client.lpush('mixes', title);
    client.ltrim('mixes', 0, MIX_LIMIT);

    // Create the mix hash
    client.hset('mix:' + title, 'id', title);
    client.hset('mix:' + title, 'author', req.session.email);
    client.hset('mix:' + title, 'artist', req.body.artist);
    client.hset('mix:' + title, 'title', realTitle);
    client.hset('mix:' + title, 'releaseDate', req.body.release_date);
    client.hset('mix:' + title, 'totalTime', req.body.total_time);

    this.getMix(title, client, function(err, mix) {
      if (err) {
        callback(err);
      } else {
        callback(null, mix);
      }
    });
  }
};

exports.deleteMix = function(req, client, callback) {
  client.hdel('mix:' + req.body.title, 'id');
  client.hdel('mix:' + req.body.title, 'author');
  client.hdel('mix:' + req.body.title, 'artist');
  client.hdel('mix:' + req.body.title, 'title');
  client.hdel('mix:' + req.body.title, 'releaseDate');
  client.hdel('mix:' + req.body.title, 'totalTime');
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
};

exports.updateMix = function(req, client, callback) {
  client.hset('mix' + req.body.mix_name, 'releaseDate', req.body.release_date);
  client.hset('mix' + req.body.mix_name, 'totalTime', req.body.total_time);

  this.getMix(req.body.mix_name, client, function(err, mix) {
    if (err) {
      callback(err);
    } else {
      callback(null, mix);
    }
  });
};
