'use strict';

define(['jquery'],
  function($) {

  var mixList = $('#mixes');
  var flashMsg = $('#flash');
  var mixForm = $('#mix-form');

  var generateMixList = function(data) {
    var mixItem = $('<li data-title=""><h2></h2><h3></h3>' +
      '<p class="release-date"></p><p class="total-time"></p>' +
      '<p class="mix-actions"></p></li>');
    mixItem.attr('data-title', data.id);
    mixItem.find('h2').text(data.artist);
    mixItem.find('h3').text(data.title);
    mixItem.find('p.release-date').text(data.releaseDate);
    mixItem.find('p.total-time').text(data.totalTime);
    if (data.isEditable) {
      var editable = $('<a href="#" class="edit">edit</a>');
      mixItem.find('.mix-actions').append(editable);
    }
    if (data.isDeletable) {
      var deletable = $('<a href="#" class="delete">delete</a>');
      mixItem.find('.mix-actions').append(deletable);
    }
    mixList.append(mixItem);
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
        mixForm.removeClass('on').addClass('off');
      }).error(function(data) {
        flashMsg
          .text(JSON.parse(data.responseText).error)
          .removeClass('off')
          .addClass('error')
          .addClass('on');
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
    },

    deleteMix: function(self) {
      $.ajax({
        url: '/mix',
        data: { title: self.closest('li').data('title') },
        type: 'DELETE',
        dataType: 'json'
      }).done(function(data) {
        self.closest('li').remove();
      });
    }
  };

  return self;
});
