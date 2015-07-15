define([
    'angular'
  , 'require/text!./elementToolbar.tpl'
    ], function(
    angular
  , template
) {
    "use strict";

    function ElementToolbarDirective() {
        return {
            restrict: 'E' // only matches element names
          , replace: false
          , template: template
          , scope: {mtkClickHandler: '=', mtkTools: '='}
        };
    }
    ElementToolbarDirective.$inject = [];
    return ElementToolbarDirective;
});
