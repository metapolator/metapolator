define(['require/text!./specimen-samples.tpl'], function(template) {
    "use strict";
    function specimenSamplesDirective() {
        return {
            restrict : 'E'
          , controller : 'SpecimenSamplesController'
          , replace : false
          , template : template
          , scope : {
                model : '=mtkModel'
            }
        };
    }


    specimenSamplesDirective.$inject = [];
    return specimenSamplesDirective;
}); 