define([
    'require/text!./font-export-panel.tpl'
    ], function(
    template
) {
    "use strict";
    function fontExportPanelDirective(mainCtrl) {
        return {
            restrict: 'E'
          , controller: 'FontExportPanelController'
          , replace: false
          , template: template
          , scope: {
                model: '=mtkModel'
            }
        };
    }
    fontExportPanelDirective.$inject = [];
    return fontExportPanelDirective;
});
