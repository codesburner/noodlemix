'use strict';

requirejs.config({
  baseUrl: '/javascripts/lib',
  enforceDefine: true,
  paths: {
    jquery: 'http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min'
  }
});

define(['jquery'],
  function($) {

  var login = $('#login');
  var logout = $('#logout');

  login.click(function(ev) {
    ev.preventDefault();
    navigator.id.request();
  });

  logout.click(function(ev) {
    ev.preventDefault();
    navigator.id.logout();
  });

  navigator.id.watch({
    loggedInEmail: currentUser,
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
});
