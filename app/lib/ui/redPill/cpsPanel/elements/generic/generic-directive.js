define([
    'angular'
  , 'require/text!./generic.tpl'
    ], function(
    angular
  , template
) {
    "use strict";

    function GenericDirective() {
        return {
            restrict: 'E' // only matches element names
          , controller: 'GenericController'
          , replace: false
          , template: template
          , scope: {item: '=', index: '=', mtkElementTools: '='}
          , controllerAs: 'ctrl'
          , bindToController: true
        };
    }
    GenericDirective.$inject = [];
    return GenericDirective;
});
