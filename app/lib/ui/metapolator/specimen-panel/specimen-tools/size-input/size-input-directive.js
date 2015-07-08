define(['require/text!./size-input.tpl'], function(template) {
    "use strict";
    function sizeInputDirective() {
        return {
            restrict : 'E'
          , controller : 'SizeInputController'
          , replace : false
          , template : template
          , scope : {
                model : '=mtkModel'
            }
        };
    }


    sizeInputDirective.$inject = [];
    return sizeInputDirective;
}); 