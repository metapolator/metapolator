define([
    'bower_components/Atem-RequireJS-Config/browserConfig'
], function(
    configure
) {
    "use strict";
    var setup = {
        baseUrl: 'lib'
      , bowerPrefix: 'bower_components'
      , paths: {
            'metapolator': './'
        }
      , shim: {
            angular: {
              deps: ['jquery'],
              exports: 'angular'
            }
        }
    };
    configure(setup, require);
    return require;
});
