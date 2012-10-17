'use strict';

/* Tag format
 * tag:mix_name_<timestamp>:
 *    author: <email>
 *    keywords: <keywords>
 *    mixName: <mix name>
 *    startTime: <start time>
 *    endTime: <end time>
 */

var utils = require('./utils');

exports.getTag = function(mixName, client, callback) {
  client.hgetall('tag:' + mixName, function(err, tag) {
    if (err) {
      callback(err);
    } else {
      callback(null, tag);
    }
  });
};

exports.addTag = function(req, client, callback) {
  var keywords = req.body.keywords.trim();
  var title = utils.setTitle(req.body.title);

  if (keywords.length < 1) {
    callback(new Error('Cannot be blank'));
  } else {
    client.hset('tag:' + title, 'author', req.session.email);
    client.hset('tag:' + title, 'keywords', keywords);
    client.hset('tag:' + title, 'mixName', title);
    client.hset('tag:' + title, 'startTime', req.body.start_time);
    client.hset('tag:' + title, 'endTime', req.body.end_time);

    this.getTag(title, client, function(err, tag) {
      if (err) {
        callback(err);
      } else {
        callback(null, tag);
      }
    });
  }
};

exports.deleteTag = function(req, client) {
  client.hdel('tag' + req.body.title);
  return;
};

exports.updateTag = function(req, client, callback) {
  var title = req.body.title;

  client.hset('tag:' + title, 'keywords', keywords);
  client.hset('tag:' + title, 'mixName', title);
  client.hset('tag:' + title, 'startTime', req.body.start_time);
  client.hset('tag:' + title, 'endTime', req.body.end_time);

  this.getTag(title, client, function(err, tag) {
    if (err) {
      callback(err);
    } else {
      callback(null, tag);
    }
  });
};
