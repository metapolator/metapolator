define(['require/text!./specimen-field.tpl'], function(template) {
    "use strict";
    function specimenFieldDirective() {
        return {
            restrict : 'E',
            controller : 'SpecimenFieldController',
            replace : false,
            template : template,
            scope : {
                model : '=mtkModel'
            }
        };
    }


    specimenFieldDirective.$inject = [];
    return specimenFieldDirective;
});
