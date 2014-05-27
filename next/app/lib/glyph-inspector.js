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
                location: './ufoJS/',
                lib: ''
            },
        ],
});

require([
    'webAPI/document'
  , 'require/domReady'
  , 'ufojs/tools/pens/SVGPen'
], function (
    document
  , domReady
  , SVGPen
) {
    "use strict";
    domReady(function() {
      console.log(SVGPen);
    })
})
