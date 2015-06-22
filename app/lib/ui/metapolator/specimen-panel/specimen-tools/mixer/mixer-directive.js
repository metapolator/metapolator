define(['require/text!./mixer.tpl'], function(template) {
    "use strict";
    function mixerDirective() {
        return {
            restrict : 'E',
            controller : 'MixerController',
            replace : false,
            template : template,
            scope : {
                model : '=mtkModel'
            }
        };
    }


    mixerDirective.$inject = [];
    return mixerDirective;
});
