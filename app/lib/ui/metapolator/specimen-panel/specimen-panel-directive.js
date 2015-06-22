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
                model: '=mtkModel'
            }
        };
    }
    specimenPanelDirective.$inject = [];
    return specimenPanelDirective;
});
