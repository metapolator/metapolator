define(['require/text!./font-by.tpl'], function(template) {
    "use strict";
    function fontByDirective() {
        return {
            restrict : 'E'
          , controller : 'FontByController'
          , replace : false
          , template : template
          , scope : {
                model : '=mtkModel'
            }
        };
    }


    fontByDirective.$inject = [];
    return fontByDirective;
}); 