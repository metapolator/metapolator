define([
   'metapolator/ui/redPill/cpsPanel/elements/helpers'
  , 'require/text!./rule.tpl'
    ], function(
    helpers
  , template
) {
    "use strict";

    function RuleDirective() {
        function link(scope, element, attrs) {
            element.bind('click', helpers.handlerDecorator(scope,
                            scope.cancelNewPropertyHandler, true, true));
            element.bind('dblclick', helpers.handlerDecorator(scope,
                            scope.initNewPropertyHandler, true, true));
        }

        return {
            restrict: 'E' // only matches element names
          , controller: 'RuleController'
          , replace: false
          , template: template
          , scope: {cpsRule: '='}
          , link: link
        };
    }
    RuleDirective.$inject = [];
    return RuleDirective;
});
