define([
    'require/text!./dialog.tpl'
    ], function(
    template
) {
    "use strict";
    function DialogDirective() {
        return {
            restrict: 'E',
            controller: 'DialogController',
            scope: {
                model: '=mtkModel'
            },
            replace: true,
            template: template,
        };
    }
    DialogDirective.$inject = [];
    return DialogDirective;
});
