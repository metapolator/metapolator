define([
    'require/text!./design-space-panel.tpl'
    ], function(
    template
) {
    "use strict";
    function designSpacePanelDirective() {
        return {
            restrict: 'E',
            controller: 'DesignSpacePanelController',
            replace: false,
            template: template,
            scope: {
                model: '=mtkModel'
            }
        };
    }
    designSpacePanelDirective.$inject = [];
    return designSpacePanelDirective;
});
