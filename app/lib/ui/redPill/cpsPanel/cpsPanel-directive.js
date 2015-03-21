define([
    'require/text!./cpsPanel.tpl'
    ], function(
    template
) {
    "use strict";
    function CpsPanelDirective() {
        return {
            restrict: 'E' // only matches element names
          , controller: 'CpsPanelController'
          , replace: false
          , template: template
          , scope: {}
        };
    }
    CpsPanelDirective.$inject = [];
    return CpsPanelDirective;
});
