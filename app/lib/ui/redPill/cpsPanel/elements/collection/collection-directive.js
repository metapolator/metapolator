define([
    'require/text!./collection.tpl'
    ], function(
    template
) {
    "use strict";
    function CollectionDirective() {
        return {
            restrict: 'E' // only matches element names
          , controller: 'CollectionController'
          , replace: false
          , template: template
          , scope: { cpsCollection: '=' }
        };
    }
    CollectionDirective.$inject = [];
    return CollectionDirective;
});
