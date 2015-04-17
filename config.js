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
      , 'util-logging': 'npm_converted/util-logging/lib'
      , 'angular': 'bower_components/angular/angular'
      , 'obtain': 'obtainJS/lib'
      , 'ufojs': 'ufoJS/lib'
      , 'yaml': 'bower_components/js-yaml/dist/js-yaml.min'
      , 'es6/Reflect': 'bower_components/harmony-reflect/reflect'
      , 'codemirror': 'bower_components/codemirror'
      , 'jszip': 'bower_components/jszip/dist/jszip'
      , 'filesaver': 'bower_components/file-saver.js/FileSaver'
      , 'ui-codemirror': 'bower_components/angular-ui-codemirror/ui-codemirror'
      , 'EventEmitter': 'bower_components/event-emitter.js/dist/event-emitter'
    }
  , shim: {
        angular: {
            exports: 'angular'
        }
    }
};
