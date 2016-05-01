define(['../app/lib/bower_components/Atem-RequireJS-Config/nodeConfig'],
function(configure) {
    var path = require('path')
      , rootDir = path.dirname(path.dirname(process.mainModule.filename))
      , setup = {
            baseUrl: rootDir + '/app/lib'
          , bowerPrefix: 'bower_components'
          , paths: {
                'metapolator': './'
            }
        }
      ;
    define('rootDir', rootDir);
    return configure.bind(null, setup);
});
