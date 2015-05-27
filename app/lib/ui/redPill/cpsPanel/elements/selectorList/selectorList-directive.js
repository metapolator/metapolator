define([
    'require/text!./selectorList.tpl'
    ], function(
    template
) {
    "use strict";

    function SelectorListDirective() {
        function link(scope, element, attrs, ctrl) {

        }

        return {
            restrict: 'E' // only matches element names
          , controller: 'SelectorListController'
          , replace: false
          , template: template
          , scope: {selectorListHost: '='}
          , bindToController: true
          , controllerAs: 'controller'
          , link: link
        };
    }
    SelectorListDirective.$inject = [];
    return SelectorListDirective;
});
