if(window.demoMode) {
    define('setup', [
        'ufojs/tools/io/staticBrowserREST'
      , 'metapolator/io/InMemory'
    ], function(
        ioREST
      , InMemory
    ) {
        // InMemory is its own event emitter
        var fsEvents, io;
        io = fsEvents = new InMemory();
        io.mkDir(false, 'project');
        return {
            io: io
          , fsEvents: fsEvents
            // fill the InMemory io module with the contents from disk
          , promise: ioREST.copyRecursive(false, 'project', io, 'project') && false
          , loadTextEditor: true
        };
    });
}
else {
    define('setup', [
        'ufojs/tools/io/staticBrowserREST'
      , 'socketio'
    ], function(
        io
      , socketio
    ) {
        return {
            io: io
          , fsEvents: socketio.connect('/fsEvents/project')
          , promise: false
          // NOTE: using `loadTextEditor:true` in this io context works
          // despite of the missing CodeMirror buffer update on file change
          // events. But, if nobody else is modifying the files, i.e a normal
          // desktop text editor, codemirror can edit the files on disk without
          // any problems.
          , loadTextEditor: false
        };
    });
}
require([
    'webAPI/document'
  , 'require/domReady'
  , 'angular'
  , 'ui/redPill/app'
  , 'RedPill'
  , 'metapolator/project/MetapolatorProject'
  , 'setup'
],
function (
    document
  , domReady
  , angular
  , angularApp
  , RedPill
  , MetapolatorProject
  , setup
) {
    "use strict";
    document.body.classList.add('dependencies-ready');
    function main() {
        var io = setup.io
          , project = new MetapolatorProject(io, 'project', setup.fsEvents)
          ;
        project.load();
        new RedPill(io, project, angularApp, setup.loadTextEditor);
        // this should be the last thing here, because domReady will execute
        // immediately if the DOM is already ready.
        domReady(function() {
            angular.bootstrap(document, [angularApp.name]);
        });
    }

    if(setup.promise)
        setup.promise.then(main);
    else
        main();
});
