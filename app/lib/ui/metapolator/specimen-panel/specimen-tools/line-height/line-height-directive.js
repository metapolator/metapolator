define(['require/text!./line-height.tpl'], function(template) {
    "use strict";
    function lineHeightDirective() {
        return {
            restrict : 'E'
          , controller : 'LineHeightController'
          , replace : false
          , template : template
          , scope : {
                model : '=mtkModel'
            }
        };
    }


    lineHeightDirective.$inject = [];
    return lineHeightDirective;
}); 