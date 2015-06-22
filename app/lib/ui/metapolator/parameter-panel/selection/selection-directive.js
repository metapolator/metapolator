define([
    'require/text!./selection.tpl'
    ], function(
    template
) {
    "use strict";
    function selectionDirective(mainCtrl) {
        return {
            restrict: 'E'
          , controller: 'SelectionController'
          , replace: false
          , template: template
          , scope: {
                model: '=mtkModel'
            }
        };
    }
    selectionDirective.$inject = [];
    return selectionDirective;
});
