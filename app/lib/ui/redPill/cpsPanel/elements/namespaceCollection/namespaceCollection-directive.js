define([
    'require/text!./namespaceCollection.tpl'
  , 'require/text!metapolator/ui/redPill/cpsPanel/elements/collection/collection.tpl'
    ], function(
    template
  , collectionTPL
) {
    "use strict";

    // This injects the raw template of collection into this template, as
    // it is the easiest way to inherit from it (that comes to my mind)
    var find = '<!-- collection.tpl -->'
      , _template = template.replace(find, collectionTPL)
      ;
    console.log(_template);

    function NamespaceCollectionDirective($compile) {
        function link(scope, element, attrs) {
            element.append(_template);
            $compile(element.contents())(scope)
        }

        return {
            restrict: 'E' // only matches element names
          , controller: 'NamespaceCollectionController'
          , replace: false
          , template: ''
          , scope: { cpsCollection: '=' , index: '='}
          , link: link
          /*CAUTION: if
          , bindToController: true >>> then reference $scope.index=controller.index in the controller

            Be careful because of the inheritance from collection-controller
          */
        };
    }
    NamespaceCollectionDirective.$inject = ['$compile'];
    return NamespaceCollectionDirective;
});
