require.config({
    baseUrl: 'lib'
  , paths: {
      'require/domReady': 'bower_components/requirejs-domready/domReady'
    , 'require/text': 'bower_components/requirejs-text/text'
    , angular: 'bower_components/angular/angular'
    }
  , shim: {
      angular: {
        exports: 'angular'
      }
    },
    packages:[
            {
                name: 'ufojs',
                location: './ufoJS/lib',
            },
            {
                name: 'obtain',
                location: './obtainJS/lib'
            }
        ],
});

require([
    'webAPI/document'
  , 'require/domReady'
  , 'angular'
  , 'glyphInspector/app'
], function (
    document
  , domReady
  , angular
  , angularApp
) {
    "use strict";
    domReady(function() {
      console.log("DOM READY")
      angular.bootstrap(document, [angularApp.name]);
    })
});
