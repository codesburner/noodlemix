'use strict';

define(['jquery'],
  function($) {

  var tagList = $('#tags');
  var flashMsg = $('#flash');
  var tagForm = $('#tag-form');
  var tracklistForm = $('#tracklist-form');

  var generateTagList = function(data) {
    var tagItem = $('<li data-title=""><img src=""><h2></h2>' +
      '<p class="start-time meta"></p><p class="end-time meta"></p>' +
      '<p class="mix-actions"></p></li>');
    tagItem.find('img').attr('src', data.gravatar);
    tagItem.attr('data-title', data.mixName);
    tagItem.find('h2').text(data.keywords);
    tagItem.find('p.start-time').text('start: ' + data.startTime);
    tagItem.find('p.end-time').text('end: ' + data.endTime);
    if (data.isTrack === 'true') {
      tagItem.addClass('track');
    }
    if (data.isDeletable) {
      var deletable = $('<a href="#" class="delete">delete</a>');
      tagItem.find('.tag-actions').append(deletable);
    }
    tagList.append(tagItem);
  };

  var self = {
    addTag: function(form) {
      $.ajax({
        url: form.attr('action'),
        type: 'POST',
        data: form.serialize(),
        dataType: 'json',
        cache: false
      }).done(function(data) {
        generateTagList(data.tag);
        tagForm.removeClass('on').addClass('off');
      }).error(function(data) {
        flashMsg
          .text(JSON.parse(data.responseText).error)
          .removeClass('off')
          .addClass('error')
          .addClass('on');
      });
    },

    addTracklist: function(form) {
      $.ajax({
        url: form.attr('action'),
        type: 'POST',
        data: form.serialize(),
        dataType: 'json',
        cache: false
      }).done(function(data) {
        for (var i = 0; i < data.tags.length; i ++) {
          generateTagList(data.tags[i]);
        }
        tracklistForm.removeClass('on').addClass('off');
      }).error(function(data) {
        flashMsg
          .text(JSON.parse(data.responseText).error)
          .removeClass('off')
          .addClass('error')
          .addClass('on');
      });
    },

    getTagsByMix: function() {
      $.ajax({
        url: '/tags/' + tagList.data('title'),
        type: 'GET',
        dataType: 'json'
      }).done(function(data) {
        for (var i = 0; i < data.tags.length; i ++) {
          generateTagList(data.tags[i]);
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
