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
  //, 'angular'
  //, 'ui/sliderDemo/app'
  //, 'SliderDemo'
  , 'metapolator/project/MetapolatorProject'
  , 'setup'
  , 'metapolator/ui/services/GlyphRendererAPI'
  , 'metapolator/models/CPS/dataTypes/CPSGeneric'
  , 'metapolator/models/CPS/elements/ParameterValue'
  , 'metapolator/models/CPS/elements/Parameter'
],
function (
    document
  , domReady
  //, angular
  //, angularApp
  //, SliderDemo
  , MetapolatorProject
  , setup
  , GlyphRendererAPI
  , CPSGeneric
  , ParameterValue
  , Parameter
) {
    "use strict";
    document.body.classList.add('dependencies-ready');
    function main() {
        var io = setup.io
          , fsEvents = setup.fsEvents
          , project = new MetapolatorProject(io, 'project')
          ;
        project.load();

        // new SliderDemo(io, fsEvents, project, angularApp, setup.loadTextEditor);
        // load all masters, because right now it is very confusing
        // when some masters are missing from the MOM
        project.masters.forEach(project.open, project);

        var glyphRendererAPI = new GlyphRendererAPI(window.document, project.controller);

        // this should be the last thing here, because domReady will execute
        // immediately if the DOM is already ready.
        domReady(function() {

            // get the rule that defines the interpolation

            // get the ParameterDictionary of the rule

            var ruleName = 'interpolated.cps'
              , master = 'interpolated'
              , ruleController = project.ruleController
              , pd = ruleController.getRule(false, ruleName)
              , parameters = pd.getItem(2).parameters
              ;

            function setParameter(name, val) {
                var value = new ParameterValue([val], [])
                  , parameter
                  ;
                value.initializeTypeFactory(name.name, CPSGeneric.factory);
                parameter = new Parameter({name:name}, value);
                parameters.setParameter(parameter);
            }

            function inputChange() {
                var x = parseFloat(inputs[0].value)
                  , y = parseFloat(inputs[1].value)
                  , a = (1-x) * (1-y)
                  , b = (  x) * (1-y)
                  , c = (1-x) * (  y)
                  , d = (  x) * (  y)
                  ;
                setParameter('proportion1', a);
                setParameter('proportion2', b);
                setParameter('proportion3', c);
                setParameter('proportion4', d);
            }

            var inputs = [
                ['width ', inputChange]
              , [' weight ', inputChange]
            ].map(
            function(setup) {
                var items = [], item, i
                  , labelText = setup[0]
                  , handler = setup[1]
                  ;
                item = document.createElement('input');
                item.setAttribute('type', 'range');
                item.setAttribute('min', 0.0);
                item.setAttribute('max', 1.0);
                item.setAttribute('value', 0.5);
                item.setAttribute('step', 0.0001);
                item.addEventListener('input', handler);

                var label = document.createElement('lablel');
                label.textContent = labelText;
                label.appendChild(item);
                document.body.appendChild(label);

                return item;
            });
            document.body.appendChild(document.createElement('br'));
            'metapolator'.split('').forEach(function(glyph) {
                document.body.appendChild(glyphRendererAPI.get(master, glyph));
            });
        });
    }

    if(setup.promise)
        setup.promise.then(main);
    else
        main();
});
