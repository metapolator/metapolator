require.config({
    baseUrl: 'app'
  , paths: {
      'require/domReady': '../../lib/bower_components/requirejs-domready/domReady'
    , 'require/text': '../../lib/bower_components/requirejs-text/text'
    , angular: '../../lib/bower_components/angular/angular'
    }
  , shim: {
      angular: {
        exports: 'angular'
      }
    },
    packages:[
            {
                name: 'ufojs',
                location: '../../lib/ufoJS/lib',
            },
            {
                name: 'obtain',
                location: '../../lib/obtainJS/lib'
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
      angular.bootstrap(document, [angularApp.name]);
    })
});
