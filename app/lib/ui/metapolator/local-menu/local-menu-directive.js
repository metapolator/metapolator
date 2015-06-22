define([
    'require/text!./local-menu.tpl'
    ], function(
    template
) {
    "use strict";
    function localMenuDirective() {
        return {
            restrict: 'E'
          , controller: 'LocalMenuController'
          , controllerAs: 'localMenuCtrl'
          , scope: true
          , replace: false
          , template: template
        };
    }
    localMenuDirective.$inject = [];
    return localMenuDirective;
});
