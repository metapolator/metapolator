define([
    'require/text!./instance-panel.tpl'
    ], function(
    template
) {
    "use strict";
    function instancePanelDirective() {
        return {
            restrict: 'E'
          , controller: 'InstancePanelController'
          , scope : {
                model : '=mtkModel'
            }
          , replace: false
          , template: template
        };
    }
    instancePanelDirective.$inject = [];
    return instancePanelDirective;
});
