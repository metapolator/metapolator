require.config({
    baseUrl: '../'
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
      , 'jquery': 'bower_components/jquery/dist/jquery.min'
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
      , 'jszip': 'bower_components/jszip/dist/jszip'
      , 'filesaver': 'bower_components/file-saver.js/FileSaver'
      , 'd3': 'bower_components/d3/d3.min'
      , 'jquery-ui': 'bower_components/jquery.ui/jquery-ui.min'
      , 'sortable': 'bower_components/angular-ui-sortable/sortable.min'
    }
  , shim: {
      angular: {
        deps: ['jquery'],
        exports: 'angular'
      },
      sortable: {
          deps: ['jquery-ui', 'angular']
      }
    }
});

require([
    'webAPI/document'
  , 'require/domReady'
  , 'angular'
  , 'ui/metapolator/app'
  , 'Metapolator'
  , 'models/ui-models/AppModel'
], function (
    document
  , domReady
  , angular
  , angularApp
  , Metapolator
  , AppModel
) {
    "use strict";
    var lasttime = null;
    window.logCall = function(name) {
        var thistime = Date.now();
        console.log(name + " " + (thistime - lasttime));
        lasttime = thistime;
    };
    
    var model = new AppModel();
    // set initial model data
    model.masterPanel.addSequence("Sequence 1");
    model.instancePanel.addSequence("Family 1");
    // creation of inital masters
    var masters = ["Regular", "Bold", "Light", "Condensed", "Extended", "Italic"];
    var glyphs = ["A", "B", "C", "D", "E", "F", "G", "H", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "a", "b", "c", "d", "e", "f", "g", "h", "i", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "space"];

    angular.forEach(masters, function(master) {
        model.masterPanel.sequences[0].addMaster(master);
        angular.forEach(glyphs, function(glyph){
            model.masterPanel.sequences[0].children[model.masterPanel.sequences[0].children.length - 1].addGlyph(glyph);
        });
    });
    
    model.designSpacePanel.addDesignSpace();
    model.designSpacePanel.currentDesignSpace = model.designSpacePanel.designSpaces[0];
    
    
    
    // The metapolator interface is made global here for development
    // this should change again!
    window.metapolator = new Metapolator(model, angularApp);
    
    // this should be the last thing here, because domReady will execute
    // immediately if dom is already ready.
    domReady(function() {
        angular.bootstrap(document, [angularApp.name]);
    });
    
    
    

    

});
