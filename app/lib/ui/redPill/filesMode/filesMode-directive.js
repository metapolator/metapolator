define([
    'require/text!./filesMode.tpl'
    ], function(
    template
) {
    "use strict";
    function filesModeDirective() {
        return {
            restrict: 'E' // only matches element names
          , controller: 'FilesModeController'
          , replace: false
          , template: template
          , scope: {}
        };
    }
    filesModeDirective.$inject = [];
    return filesModeDirective;
})
