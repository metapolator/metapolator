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

require([
    'webAPI/document'
  , 'require/domReady'
  , 'angular'
  , 'ng/app'
  , 'Metapolator'
  , './models/AppModel'
], function (
    document
  , domReady
  , angular
  , angularApp
  , Metapolator
  , AppModel
) {
    // This model is a stub. We will have to create something
    // that suits our needs :-)
    // general model
    var model = new AppModel();
    // create a widget to start with
    model.generic.more();
    
    // The metapolator interface is made global here for development
    // this should change again!
    window.metapolator = new Metapolator(model, angularApp);
    
    // this should be the last thing here, because domReady will execute
    // immediately if dom is already ready.
    domReady(function() {
        angular.bootstrap(document, [angularApp.name]);
    })
})
