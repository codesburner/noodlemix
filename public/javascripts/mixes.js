'use strict';

define(['jquery'],
  function($) {

  var mixList = $('#mixes');

  var generateMixList = function(data) {
    var mixItem = $('<li><h2></h2><h3></h3><p class="release-date"></p>' +
      '<p class="total-time"></p></li>');
    mixItem.find('h2').text(data.artist);
    mixItem.find('h3').text(data.title);
    mixItem.find('p.release-date').text(data.releaseDate);
    mixItem.find('p.total-time').text(data.totalTime);
    mixList.prepend(mixItem);
  };

  var self = {
    addMix: function(form) {
      $.ajax({
        url: form.attr('action'),
        type: 'POST',
        data: form.serialize(),
        dataType: 'json',
        cache: false
      }).done(function(data) {
        generateMixList(data.mix);
      });
    },

    getRecentMixes: function() {
      $.ajax({
        url: '/recent',
        type: 'GET',
        dataType: 'json'
      }).done(function(data) {
        for (var i = 0; i < data.mixes.length; i ++) {
          generateMixList(data.mixes[i]);
        }
      });
    }
  };

  return self;
});
