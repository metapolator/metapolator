define([
    'require/text!./parameterDict.tpl'
    ], function(
    template
) {
    "use strict";
    function ParameterDictDirective() {
        return {
            restrict: 'E' // only matches element names
          , controller: 'ParameterDictController'
          , replace: false
          , template: template
          , scope: { cpsParameterDict: '=' }
        };
    }
    ParameterDictDirective.$inject = [];
    return ParameterDictDirective;
});
