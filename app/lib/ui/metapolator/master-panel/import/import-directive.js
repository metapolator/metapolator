define([
    'require/text!./import.tpl'
    ], function(
    template
) {
    "use strict";
    function mastersImportDirective() {
        function link(scope, element, attrs, controller) {
        }
        return {
            restrict: 'E' // only matches element names
          , controller: 'MastersImportController'
          , replace: false
          , template: template
          , scope : {}
          , bindToController: {importProcess : '=mtkImportProcess'}
          , controllerAs: '$ctrl'
          , link: link
        };
    }
    mastersImportDirective.$inject = [];
    return mastersImportDirective;
});
