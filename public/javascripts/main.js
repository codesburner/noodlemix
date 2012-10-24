'use strict';

requirejs.config({
  baseUrl: '/javascripts',
  enforceDefine: true,
  paths: {
    jquery: '/javascripts/jquery'
  }
});

define(['jquery', 'mixes', 'tags'],
  function($, mixes, tags) {

  var body = $('body');
  var mixForm = body.find('#mix-form');
  var tagForm = body.find('#tag-form');
  var tracklistForm = body.find('#tracklist-form');
  var deletable = body.find('.delete');
  var mixList = body.find('#mixes');
  var tagList = body.find('#tags');
  var flashMsg = body.find('#flash');
  var cancel = body.find('.cancel');

  body.click(function() {
    if (flashMsg.hasClass('on')) {
      flashMsg.addClass('off', function() {
        var self = $(this);

        self
          .removeClass('error')
          .removeClass('on');
      });
    }
  });

  body.on('click', '.cancel', function() {
    var currentForm = $(this).closest('form');
    currentForm.removeClass('on');
    currentForm.addClass('off');
  });

  body.on('click', '#add', function() {
    if (mixForm.length > 0) {
      mixForm.removeClass('off').addClass('on');
    } else if (tagForm.length > 0) {
      tagForm.removeClass('off').addClass('on');
    }
  });

  body.on('click', '#add-tracklist', function() {
    tracklistForm.removeClass('off').addClass('on');
  });

  body.on('click', '#login', function(ev) {
    ev.preventDefault();

    navigator.id.get(function(assertion) {
      if (!assertion) {
        return;
      }

      $.ajax({
        url: '/persona/verify',
        type: 'POST',
        data: { assertion: assertion },
        dataType: 'json',
        cache: false
      }).done(function(data) {
        if (data.status === 'okay') {
          document.location.href = '/';
        } else {
          flashMsg.text('Login failed because ' + data.reason);
        }
      });
    });
  });

  body.on('click', '#logout', function(ev) {
    ev.preventDefault();

    $.ajax({
      url: '/persona/logout',
      type: 'POST',
      dataType: 'json',
      cache: false
    }).done(function(data) {
      if (data.status === 'okay') {
        document.location.href = '/';
      } else {
        flashMsg.text('Logout failed because ' + data.reason);
      }
    });
  });

  if (mixForm.length > 0) {
    mixes.getRecentMixes();
  } else if (tagForm.length > 0) {
    tags.getTagsByMix();
  }

  mixForm.submit(function(ev) {
    ev.preventDefault();

    var self = $(this);
    mixes.addMix(self);
  });

  mixList.on('click', '.delete', function() {
    var self = $(this);

    mixes.deleteMix(self);
  });

  tagForm.submit(function(ev) {
    ev.preventDefault();

    var self = $(this);
    tags.addTag(self);
    tagForm.find('button.cancel').click();
  });

  tracklistForm.submit(function(ev) {
    ev.preventDefault();

    var self = $(this);
    tags.addTracklist(self);
    tagForm.find('button.cancel').click();
  });

  tagList.on('click', '.delete', function() {
    var self = $(this);

    tags.deleteTag(self);
  });

  mixList.on('click', 'li', function() {
    var self = $(this);

    mixList.find('li .tag-edit').hide();
    self.find('.tag-edit').show();
  });
});
