define([
    'angular'
  , 'require/text!./newNamespaceCollection.tpl'
    ], function(
    angular
  , template
) {
    "use strict";

    function newNamespaceCollectionDirective($compile) {
        function link(scope, element, attrs) {
            var childElement = element[0].getElementsByTagName('mtk-cps-new-selector-list')[0]
              , childScope = angular.element(childElement).isolateScope()
              ;

            scope.hasFocus = function() {
                return childScope.hasFocus();
            };
        }

        return {
            restrict: 'E' // only matches element names
          , controller: 'NewNamespaceCollectionController'
          , replace: false
          , template: template
          , scope: {index: '='}
          , link: link
          , bindToController: true
          , controllerAs: 'ctrl'
        };
    }
    newNamespaceCollectionDirective.$inject = [];
    return newNamespaceCollectionDirective;
});
