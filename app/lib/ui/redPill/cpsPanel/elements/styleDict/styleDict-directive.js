define([
    'angular'
  , 'require/text!./styleDict.tpl'
    ], function(
    angular
  , template
) {
    "use strict";

    function styleDictDirective($compile, dragDataService, dragIndicatorService) {
        //function link(scope, element, attrs, controller) {}


        return {
            restrict: 'E' // only matches element names
          , controller: 'StyleDictController'
          , replace: false
          , template: template
          , scope: { element: '=item' }
          //, link:link
          , controllerAs: 'ctrl'
          , bindToController: true
        };
    }
    styleDictDirective.$inject = ['$compile'];
    return styleDictDirective;
});
