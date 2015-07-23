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

    function doubleClickHandler(findElement, getPositionReference, $compile
                              , scope , controller, element, container, event) {
        var target
          , placementReference
          , uiElement
          , index
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
        index = target.index;
        if(target.insertPosition === 'after')
            index +=1;
        // TODO: make a form here
        uiElement = element.ownerDocument.createElement('mtk-cps-new-item');
        // add attribute "index", index
        domStuff.insert(placementReference, target.insertPosition, uiElement);
        $compile(angular.element(uiElement))(scope);

        // and when the interface loses focus
        // finalize()
        // remove()
    }


    function CollectionNewItemDirective($compile) {
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
              , $compile
              , scope
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
    CollectionNewItemDirective.$inject = ['$compile'];
    return CollectionNewItemDirective;
});
