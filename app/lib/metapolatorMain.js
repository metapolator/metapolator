require([
    'webAPI/document'
  , 'require/domReady'
  , 'angular'
  , 'ui/metapolator/app'
  , 'Metapolator'
  , 'models/metapolator/AppModel'
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
