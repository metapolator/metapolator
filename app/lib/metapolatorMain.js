require([
    'webAPI/document'
  , 'require/domReady'
  , 'angular'
  , 'ufojs/tools/io/staticBrowserREST'
  , 'metapolator/io/InMemory'
  , 'metapolator/ui/metapolator/app'
  , 'metapolator/project/MetapolatorProject'
  , 'metapolator/Metapolator'
], function (
    document
  , domReady
  , angular
  , ioREST
  , InMemory
  , angularApp
  , MetapolatorProject
  , Metapolator
) {
    "use strict";

    document.body.classList.add('dependencies-ready');
    // init, loading the project from http at './project'
    var projectPath = 'project'
      , fsEvents
      , io
      , promise
      ;
    // InMemory is its own event emitter
    io = fsEvents = new InMemory();
    io.mkDir(false, 'project');
    function main() {
        var project, metapolator;
        project = new MetapolatorProject(io, 'project', fsEvents);
        project.load();
        metapolator = new Metapolator(project, angularApp);
        // The metapolator interface is made global here for development
        // FIXME: this should change again!
        window.metapolator = metapolator;
        // this should be the last thing here, because domReady will execute
        // immediately if dom is already ready.
        domReady(function() {
            angular.bootstrap(document, [angularApp.name]);
        });
    }

    // copy the project data from the server into memory
    // then run main
    ioREST.copyRecursive(true, projectPath, io, 'project')
          .then(main)
          ;
});
