define([
    'require/text!./propertyDict.tpl'
    ], function(
    template
) {
    "use strict";
    function PropertyDictDirective() {
        return {
            restrict: 'E' // only matches element names
          , controller: 'PropertyDictController'
          , replace: false
          , template: template
          , scope: { cpsPropertyDict: '=' }
        };
    }
    PropertyDictDirective.$inject = [];
    return PropertyDictDirective;
});
