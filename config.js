module.exports = {
    nodeRequire: require
  , baseUrl: __dirname + '/app/lib'
  , paths: {
        'require/domReady': 'bower_components/requirejs-domready/domReady'
      , 'require/text': 'bower_components/requirejs-text/text'
      , 'metapolator': './'
      , 'commands': '../commands'
      , 'gonzales': 'npm_converted/gonzales/lib'
      , 'commander': 'npm_converted/commander/index'
      , 'complex':  'npm_converted/immutable-complex/lib'
      , 'angular': 'bower_components/angular/angular'
      , 'obtain': 'obtainJS/lib'
      , 'ufojs': 'ufoJS/lib'
      , 'yaml': 'bower_components/js-yaml/dist/js-yaml.min'
    }
  , shim: {
        angular: {
            exports: 'angular'
        }
      //, yaml: {
      //      exports: 'jsyaml'
      //}
    }
};
