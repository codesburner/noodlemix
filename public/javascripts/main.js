'use strict';

requirejs.config({
  baseUrl: '/javascripts',
  enforceDefine: true,
  paths: {
    jquery: '/javascripts/jquery'
  }
});

define(['jquery', 'mixes'],
  function($, mixes) {

  var login = $('#login');
  var logout = $('#logout');
  var mixForm = $('#mix-form');

  login.click(function(ev) {
    ev.preventDefault();
    navigator.id.request();
  });

  logout.click(function(ev) {
    ev.preventDefault();
    navigator.id.logout();
  });

  navigator.id.watch({
    loggedInUser: currentUser,
    onlogin: function(assertion) {
      $.ajax({
        type: 'POST',
        url: '/login',
        data: { assertion: assertion },
        success: function(res, status, xhr) {
          currentUser = res.email;
          window.location.reload();
        },
        error: function(res, status, xhr) {
          alert('login failure ' + res);
        }
      });
    },
    onlogout: function() {
      $.ajax({
        type: 'GET',
        url: '/logout',
        success: function(res, status, xhr) {
          window.location.reload();
        },
        error: function(res, status, xhr) {
          console.log('logout failure ' + res);
        }
      });
    }
  });

  mixes.getRecentMixes();

  mixForm.submit(function(ev) {
    ev.preventDefault();

    var self = $(this);
    mixes.addMix(self);
  });
});
