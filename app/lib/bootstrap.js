require([
    'app/lib/bower_components/Atem-RequireJS-Config/browserConfig'
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
    }
    configure(setup, require);
    require(['metapolator/main']);
});
