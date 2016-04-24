define([
    'require/text!./selection-parameter.tpl'
    ], function(
    template
) {
    "use strict";
    function selectionParameterDirective(mainCtrl) {
        return {
            restrict: 'E'
          , controller: 'SelectionParameterController'
          , replace: false
          , template: template
          , scope: {
                model: '=mtkModel'
            }
        };
    }
    selectionParameterDirective.$inject = [];
    return selectionParameterDirective;
});
