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

            scope.$on('newPropertyRequest', helpers.handlerDecorator(scope,
                            controller.initNewPropertyHandler, true, true));

            //element.bind('dblclick',
        }

        return {
            restrict: 'E' // only matches element names
          , controller: 'RuleController'
          , replace: false
          , template: template
          , scope: {cpsRule: '=', index: '=', mtkElementTools: '='}
          , bindToController: true
          , controllerAs: 'controller'
          , link: link
        };
    }
    RuleDirective.$inject = [];
    return RuleDirective;
});
