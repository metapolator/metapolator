define([
    ], function(
) {
    "use strict";
    function localMenuDirective() {
        return {
            restrict: 'E'
          , controller: 'LocalMenuController'
          , controllerAs: 'localMenuCtrl'
          , scope: true
          , replace: false
        };
    }
    localMenuDirective.$inject = [];
    return localMenuDirective;
});
