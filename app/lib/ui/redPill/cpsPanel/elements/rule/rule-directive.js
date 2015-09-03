define([
    'angular'
  , 'metapolator/ui/redPill/cpsPanel/elements/helpers'
  , 'require/text!./rule.tpl'
    ], function(
    angular
  , helpers
  , template
) {
    "use strict";

    function RuleDirective() {
        function link(scope, element, attrs, controller) {
            element.bind('click', helpers.handlerDecorator(scope,
                            controller.cancelNewPropertyHandler, true, true));

            scope.$on('newPropertyRequest', helpers.handlerDecorator(scope,
                            controller.initNewPropertyHandler, true, true));

            scope.updateUsedNames = function(usedNamesSet) {
                var i,l,children = element[0].children, child, scope;
                for(i=0,l=children.length;i<l;i++) {
                    child = children[i];
                    if(child.tagName.toLowerCase() !== 'mtk-cps-property-dict')
                        continue;
                    scope = angular.element(child).isolateScope();
                    scope.updateUsedNames(usedNamesSet);
                }
            };

            //element.bind('dblclick',
        }

        return {
            restrict: 'E' // only matches element names
          , controller: 'RuleController'
          , replace: false
          , template: template
          , scope: {cpsRule: '=item', index: '=', mtkElementTools: '='}
          , bindToController: true
          , controllerAs: 'controller'
          , link: link
        };
    }
    RuleDirective.$inject = [];
    return RuleDirective;
});
