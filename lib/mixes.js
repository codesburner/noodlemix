'use strict';

/* Mix format
 * mix:mix_name_<timestamp>:
 *    author: <email>
 *    releaseDate: <release date>
 *    totalTime: <total time>
 */

exports.getMix = function(mixName, client, callback) {
  client.hgetall('mix:' + mixName, function(err, mix) {
    if (err) {
      callback(err);
    } else {
      callback(null, mix);
    }
  });
};

exports.addMix = function(req, client, callback) {
  client.hset('mix' + req.body.mix_name, 'author', req.session.email);
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

exports.deleteMix = function(req, client) {
  client.hdel('mix' + req.query.mix_name);
  return;
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
