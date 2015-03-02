define([
    'require/text!./app.tpl'
    ], function(
    template
) {
    "use strict";
    function appDirective() {
        return {
            restrict: 'E' // only matches element names
          , controller: 'AppController'
          , replace: false
          , template: template
        };
    }
    appDirective.$inject = [];
    return appDirective;
});
