define([
   'metapolator/ui/redPill/cpsPanel/elements/helpers'
  , 'require/text!./rule.tpl'
    ], function(
    helpers
  , template
) {
    "use strict";

    function RuleDirective() {
        function link(scope, element, attrs, controller) {
            element.bind('click', helpers.handlerDecorator(scope,
                            controller.cancelNewPropertyHandler, true, true));
            element.bind('dblclick', helpers.handlerDecorator(scope,
                            controller.initNewPropertyHandler, true, true));
        }

        return {
            restrict: 'E' // only matches element names
          , controller: 'RuleController'
          , replace: false
          , template: template
          , scope: {cpsRule: '=', index: '='}
          , bindToController: true
          , controllerAs: 'controller'
          , link: link
        };
    }
    RuleDirective.$inject = [];
    return RuleDirective;
});
