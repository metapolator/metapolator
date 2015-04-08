define([
    'require/text!./property.tpl'
    ], function(
    template
) {
    "use strict";
    function PropertyDirective() {
        return {
            restrict: 'E' // only matches element names
          , controller: 'PropertyController'
          , replace: false
          , template: template
          , scope: {cpsPropertyDict: '=', property: '='}
        };
    }
    PropertyDirective.$inject = [];
    return PropertyDirective;
});
