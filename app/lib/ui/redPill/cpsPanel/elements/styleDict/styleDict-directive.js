define([
    'angular'
  , 'require/text!./styleDict.tpl'
    ], function(
    angular
  , template
) {
    "use strict";

    function styleDictDirective() {
        function link(scope, element, attrs, controller) {
            scope.updateNames = function(usedNamesSet) {
                var i,l,children = element[0].children, child;
                for(i=0,l=children.length;i<l;i++) {
                    child = children[i];
                    if(child.tagName.toLowerCase() !== 'mtk-cps-rule')
                        continue;
                    angular.element(child)
                           .isolateScope()
                           .updateUsedNames(usedNamesSet);

                }
            };
        }


        return {
            restrict: 'E' // only matches element names
          , controller: 'StyleDictController'
          , replace: false
          , template: template
          , scope: { element: '=item' }
          , link:link
          , controllerAs: 'ctrl'
          , bindToController: true
        };
    }
    styleDictDirective.$inject = [];
    return styleDictDirective;
});
