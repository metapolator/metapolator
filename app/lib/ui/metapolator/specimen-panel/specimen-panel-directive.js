define([
    'require/text!./specimen-panel.tpl'
    ], function(
    template
) {
    "use strict";
    function specimenPanelDirective(mainCtrl) {
        return {
            restrict: 'E'
          , controller: 'SpecimenPanelController'
          , replace: false
          , template: template
          , scope: {
                sequences : '=mtkModel'
              , type : '=mtkType'
              , rubberband : '=mtkRubberband'
              , glyphrange : '=mtkGlyphrange'
            }
        };
    }
    specimenPanelDirective.$inject = [];
    return specimenPanelDirective;
});
