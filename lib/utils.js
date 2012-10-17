'use strict';

var request = require('request');

exports.setTitle = function(title) {
  return title
    .replace(/[^A-Z0-9-_]+/gi, '').toLowerCase().trim();
};