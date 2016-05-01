define([
    'require/text!./master-panel.tpl'
    ], function(
    template
) {
    "use strict";
    function masterPanelDirective() {
        return {
            restrict: 'E'
          , controller: 'MasterPanelController'
          , scope : {
                model : '=mtkModel'
            }
          , replace: false
          , template: template
        };
    }
    masterPanelDirective.$inject = [];
    return masterPanelDirective;
});
