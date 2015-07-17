define([
    'angular'
  , './specificTargetTools'
  , 'metapolator/ui/redPill/cpsPanel/dragAndDrop/genericTargetTools'
  , 'metapolator/ui/domStuff'
    ], function(
    angular
  , specificTargetTools
  , genericTargetTools
  , domStuff
) {
    "use strict";

    var findElement = specificTargetTools.findElement
      , getPositionReference = specificTargetTools.getPositionReference
      , getTargetIndex = genericTargetTools.getTargetIndex
      , getTargetData = genericTargetTools.getTargetData
      ;

    function doubleClickHandler(findElement, getPositionReference
                                , controller, element, container, event) {
        var target
          , placementReference
          , uiElement
          ;

        if(event.defaultPrevented)
            // someone below already consumed the event
            return;

        if(!controller.empty)
            target = getTargetData(findElement, element, event);
        else
            target = {
                index: 0
              , insertPosition: 'append'
              , element: container
            };

        if(!target.insertPosition)
            return;

        // consume the event
        event.preventDefault();

        // place the interface:
        placementReference = getPositionReference(controller.empty, target.element, container);
        // target.insertPosition is "before" or "after" or "append"

        // TODO: make a form here
        uiElement = element.ownerDocument.createElement('h3');
        uiElement.textContent = 'HeyHey!';

        domStuff.insert(placementReference, target.insertPosition, uiElement);

        // and when the interface loses focus
        // finalize()
        // remove()
    }


    function CollectionNewItemDirective(DropHelper) {
        function link(_scope, element, attrs) {
            var scope = element.isolateScope()
              , controller = scope.controller
              , container = element[0] // needed?
              // maybe use these to chose the form?
              //, dataTypes = ['cps/rule', 'cps/namespace-collection'
              //              , 'cps/comment', 'cps/generic-collection-item'
              //              , 'cps/import-collection']
              ;
            element.on('dblclick', doubleClickHandler.bind(
                null
              , findElement
              , getPositionReference
              , controller
              , element[0]
              , container
            ));
        }

        return {
            restrict: 'A' // only matches element names
          , link:link
        };
    }
    CollectionNewItemDirective.$inject = [];
    return CollectionNewItemDirective;
});
