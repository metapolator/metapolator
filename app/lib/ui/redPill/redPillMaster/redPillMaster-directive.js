define([
    'require/text!./redPillMaster.tpl'
    ], function(
    template
) {
    "use strict";
    function redPillMasterDirective() {
        return {
            restrict: 'E' // only matches element names
          , controller: 'RedPillMasterController'
          , replace: false
          , template: template
          , scope: {
                master: '=mtkMasterName'
          }
        };
    }
    redPillMasterDirective.$inject = [];
    return redPillMasterDirective;
})
