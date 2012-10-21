'use strict';

/* Tag format
 * tag:mix_name_<timestamp>:
 *    author: <email>
 *    keywords: <keywords>
 *    mixName: <mix name>
 *    isTrack: <is track>
 *    startTime: <start time>
 *    endTime: <end time>
 */

var utils = require('./utils');
var gravatar = require('gravatar');

exports.getTag = function(req, title, keyword, client, callback) {
  client.hgetall('tag:' + title + ':' + keyword, function(err, tag) {
    if (err) {
      callback(err);
    } else {
      if (tag) {
        var isDeletable = false;

        // Only authors can delete
        if (req.session.email === tag.author) {
          isDeletable = true;
        }

        tag.isDeletable = isDeletable;
        callback(null, tag);
      } else {
        callback(new Error('No tag found'))
      }
    }
  });
};

exports.getTagsByMix = function(req, client, callback) {
  var self = this;

  client.smembers('trackset:' + req.params.title, function(err, tags) {
    if (err) {
      callback(err);
    } else {
      var tagList = [];

      if (tags.length > 0) {
        tags.forEach(function(tagItem) {
          var keyword = tagItem.split(':').slice(1).join(':');

          self.getTag(req, req.params.title, keyword, client, function(err, tag) {
            if (err) {
              callback(err);
            } else {
              tagList.push(tag);

              if (tagList.length === tags.length) {
                callback(null, tagList);
              }
            }
          });
        });
      } else {
        callback(null, tagList);
      }
    }
  });
};

exports.getKeywordsByUser = function(req, client, callback) {
  var self = this;

  client.smembers('tagset:' + req.session.email, function(err, tags) {
    if (err) {
      callback(err);
    } else {
      var keywordList = [];

      if (tags.length > 0) {
        tags.forEach(function(tag) {

          keywordList.push(tag);

          if (keywordList.length === tags.length) {
            callback(null, keywordList);
          }
        });
      } else {
        callback(null, keywordList);
      }
    }
  });
};

exports.addTag = function(req, client, callback) {
  var keywords = req.body.keywords.trim();
  var title = utils.setTitle(req.body.mix_name);
  var keywordTitle = utils.setTitle(keywords);

  if (keywords.length < 1) {
    callback(new Error('Keywords cannot be blank'));
  } else {
    var isTrack = false;

    if (req.body.is_track) {
      isTrack = true;
    }

    // Author's tag set
    client.sadd('tagset:' + req.session.email, title + ':' + keywordTitle);

    // Global mix track set
    client.sadd('trackset:' + title, title + ':' + keywordTitle);

    var key = 'tag:' + title + ':' + keywordTitle;
    client.hset(key, 'author', req.session.email);
    client.hset(key, 'gravatar', gravatar.url(req.session.email));
    client.hset(key, 'keywords', keywords);
    client.hset(key, 'mixName', title);
    client.hset(key, 'isTrack', isTrack);
    client.hset(key, 'startTime', req.body.start_time);
    client.hset(key, 'endTime', req.body.end_time);

    this.getTag(req, title, keywordTitle, client, function(err, tag) {
      if (err) {
        callback(err);
      } else {
        callback(null, tag);
      }
    });
  }
};

exports.deleteTag = function(req, client, callback) {
  this.getTag(req, req.body.mix_name, req.body.title, client, function(err, tag) {
    if (err) {
      callback(err);
    } else {
      if (req.session.email !== tag.author) {
        callback(new Error('You are not the author of this tag'));
      } else {
        client.hdel('tag' + req.body.title);
        callback(null, true);
      }
    }
  });
};

exports.cleanUp = function(req, client) {
  client.smembers('tagset:' + req.session.email, function(err, tags) {
    tags.forEach(function(tag) {
      client.exists('tag:' + tag, function(err, tagExists) {
        if (!tagExists) {
          client.srem('tagset:' + req.session.email, tag);
        }
      });
    });
  });
};
