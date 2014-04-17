"use strict";
require.config({
    baseUrl: 'lib'
  , paths: {
      'require/domReady': 'bower_components/requirejs-domready/domReady'
    , 'require/text': 'bower_components/requirejs-text/text'
    , angular: 'bower_components/angular/angular'
    , ng: '../ng'
    }
  , shim: {
      angular: {
        exports: 'angular'
      }
    }
});

require(['Metapolator'], function(Metapolator) {
    var metapolator = new Metapolator();
})
