define([
    'require/text!./instance.tpl'
    ], function(
    template
) {
    "use strict";
    function instanceDirective() {
        return {
            restrict: 'E'
          , controller: 'InstanceController'
          , scope : {
                model : '=mtkModel'
            }
          , replace: false
          , template: template
        };
    }
    instanceDirective.$inject = [];
    return instanceDirective;
});
