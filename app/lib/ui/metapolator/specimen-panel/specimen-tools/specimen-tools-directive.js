define(['require/text!./specimen-tools.tpl'], function(template) {
    "use strict";
    function specimenToolsDirective(mainCtrl) {
        return {
            restrict : 'E',
            controller : 'SpecimenToolsController',
            replace : false,
            template : template,
            scope : {
                model : '=mtkModel'
            }
        };
    }


    specimenToolsDirective.$inject = [];
    return specimenToolsDirective;
});
