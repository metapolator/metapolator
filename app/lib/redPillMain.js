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
    }
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

require([
    'webAPI/document'
  , 'require/domReady'
  , 'angular'
  , 'ui/redPill/app'
  , 'RedPill'
  , 'ufojs/tools/io/staticBrowserREST'
  , 'socketio'
  , 'metapolator/project/MetapolatorProject'
], function (
    document
  , domReady
  , angular
  , angularApp
  , RedPill
  , io
  , socketio
  , MetapolatorProject
) {
    "use strict";

    var project = new MetapolatorProject(io, 'project')
      , fsEvents = socketio.connect('/fsEvents/project')
      ;
    project.load();
    new RedPill(project, angularApp, fsEvents);
    // this should be the last thing here, because domReady will execute
    // immediately if the DOM is already ready.
    domReady(function() {
        angular.bootstrap(document, [angularApp.name]);
    });
});
