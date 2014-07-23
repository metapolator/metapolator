requirejs.config({
    baseUrl: 'lib'
  , paths: {
        'require/domReady': 'bower_components/requirejs-domready/domReady'
      , 'require/text': 'bower_components/requirejs-text/text'
      , 'metapolator': './'
      , 'gonzales': 'npm_converted/gonzales/lib'
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
      , yaml: {
            exports: 'jsyaml'
      }
    }
});


require([
    'webAPI/document'
  , 'require/domReady'
  , 'angular'
  , 'ui/redPill/app'
  , 'RedPill'
  , 'ufojs/tools/io/staticBrowserREST'
  , 'metapolator/project/MetapolatorProject'
], function (
    document
  , domReady
  , angular
  , angularApp
  , RedPill
  , io
  , MetapolatorProject
) {
    "use strict";
    

    var project = new MetapolatorProject(io, 'project');
    project.load();
    new RedPill(project, angularApp);
    // this should be the last thing here, because domReady will execute
    // immediately if dom is already ready.
    domReady(function() {
        angular.bootstrap(document, [angularApp.name]);
    });
})
