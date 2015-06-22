define([
    'require/text!./parameter-panel.tpl'
    ], function(
    template
) {
    "use strict";
    function parameterPanelDirective(mainCtrl) {
        return {
            restrict: 'E'
          , controller: 'ParameterPanelController'
          , replace: false
          , template: template
          , scope: {
                model: '=mtkModel'
            }
        };
    }
    parameterPanelDirective.$inject = [];
    return parameterPanelDirective;
});
