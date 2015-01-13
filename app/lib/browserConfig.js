requirejs.config({
    baseUrl: 'lib'
  , paths: {
        'require/domReady': 'bower_components/requirejs-domready/domReady'
      , 'require/text': 'bower_components/requirejs-text/text'
      , 'metapolator': './'
      , 'gonzales': 'npm_converted/gonzales/lib'
      , 'complex':  'npm_converted/immutable-complex/lib'
      , 'util-logging': 'npm_converted/util-logging/lib'
      , 'util': 'npm_converted/util'
      , 'path': 'npm_converted/path/path'
      , 'inherits': 'npm_converted/inherits/inherits'
      , 'angular': 'bower_components/angular/angular'
      , 'obtain': 'obtainJS/lib'
      , 'ufojs': 'ufoJS/lib'
      , 'yaml': 'bower_components/js-yaml/dist/js-yaml.min'
         // code mirror uses AMD define style if available :-)
      , 'codemirror': 'bower_components/codemirror'
      , 'ui-codemirror': 'bower_components/angular-ui-codemirror/ui-codemirror'
      , 'es6/Reflect': 'bower_components/harmony-reflect/reflect'
      , 'socketio': '../socket.io/socket.io'
      , 'EventEmitter': 'bower_components/event-emitter.js/dist/event-emitter'
    }
  // exclude on build 
  , excludeShallow: [
        // the optimizer can't read es6 generators
        // NOTE: for dependency tracing the genereated es5 version is used
        // by the optimizer. The feature detection below then swaps the path
        // used to load ExportController when the browser executes this.
        'metapolator/project/ExportController'
        // see the es6/Proxy module, we load this only when needed
      , 'es6/Reflect'
    ]
  , shim: {
        angular: {
            exports: 'angular'
        }
      , yaml: {
            exports: 'jsyaml'
        }
      , 'es6/Reflect': {
            exports: 'Reflect'
        }
        //These script dependencies should be loaded before loading
        //ui-codemirror
      , 'ui-codemirror': {
            deps: ['angular', 'GlobalCodeMirror']
        }
      , 'socketio': {
            exports: 'io'
        }
    }
});

// feature detection for generators
try {
    eval("(function *(){})()");
    requirejs.config({
    paths: {
        'metapolator/project/ExportController': 'project/ExportController.es6'
    }});
} catch(err) {
    console,log(err);
    console.info("No generators, falling back.");
}

// ui code mirror looks for a global CodeMirror object, which is not defined
// by code mirror when loaded via AMD ... m(
// this is the test in the file:
// if (angular.isUndefined(window.CodeMirror))
define('GlobalCodeMirror', [
    'codemirror/lib/codemirror'
  , 'codemirror/mode/css/css'
    ], function(codemirror) {
    window.CodeMirror = codemirror;
    return undefined;
});
