define([
    'angular'
  , './specificTargetTools'
    ], function(
    angular
  , specificTargetTools
) {
    "use strict";

    var findElement = specificTargetTools.findElement
      , getPositionReference = specificTargetTools.getPositionReference
      ;

    function CollectionDropDirective(DropHelper) {
        function link(_scope, element, attrs) {
                // should be possibly be done with some configuration.
            var scope = element.isolateScope()
              , controller = scope.controller
              , container = element[0]
              , indicatorId = 'cps-drop-indicator'
              , dataTypes = ['cps/rule', 'cps/namespace-collection'
                            , 'cps/comment', 'cps/generic-collection-item'
                            , 'cps/import-collection']
              , dropHelper = new DropHelper(
                    findElement
                  , getPositionReference
                  , dataTypes
                  , indicatorId
                  , controller
                  , element[0]
                  , container
                )
              ;

            element.on('dragover', dropHelper.dragoverHandler);
            element.on('drop', dropHelper.dropHandler);
        }

        return {
            restrict: 'A' // only matches element names
          , link:link
        };
    }
    CollectionDropDirective.$inject = ['DropHelper'];
    return CollectionDropDirective;
});
