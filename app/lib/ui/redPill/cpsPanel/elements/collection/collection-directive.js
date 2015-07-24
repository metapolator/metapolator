define([
    'angular'
  , 'require/text!./collection.tpl'
    ], function(
    angular
  , template
) {
    "use strict";


    function CollectionDirective($compile, dragDataService, dragIndicatorService) {
        function link(scope, element, attrs, controller) {
            element.append(template);
            $compile(element.contents())(scope);
        }


        return {
            restrict: 'E' // only matches element names
          , controller: 'CollectionController'
          , replace: false
          // because of recursion problems of angularjs, the template is
          // applied in the link function
          , template: ''
          , scope: { cpsCollection: '=item' }
          , link:link
        };
    }
    CollectionDirective.$inject = ['$compile'];
    return CollectionDirective;
});
