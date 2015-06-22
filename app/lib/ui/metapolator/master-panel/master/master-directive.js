define([
    'require/text!./master.tpl'
    ], function(
    template
) {
    "use strict";
    function masterDirective() {
        return {
            restrict: 'E',
            controller: 'MasterController',
            scope : {
                model : '=mtkModel'
            },
            replace: false,
            template: template
        };
    }
    masterDirective.$inject = [];
    return masterDirective;
});
