define([
    'require/text!./namespaceCollection.tpl'
    ], function(
    template
) {
    "use strict";
    function NamespaceCollectionDirective() {
        return {
            restrict: 'E' // only matches element names
          , controller: 'NamespaceCollectionController'
          , replace: false
          , template: template
          , scope: { cpsCollection: '=' }
        };
    }
    NamespaceCollectionDirective.$inject = [];
    return NamespaceCollectionDirective;
});
