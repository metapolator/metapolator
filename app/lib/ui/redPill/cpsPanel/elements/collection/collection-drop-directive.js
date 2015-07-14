define([
    'angular'
    ], function(
    angular
) {
    "use strict";

    function findElement(element, dropElementTags, parent) {
        var children = parent.children
          , allowedParents = new Set()
          , i, l, child
          , allowedTags = new Set(dropElementTags.map(function(s){return s.toUpperCase();}))
          , current
          ;
        for(i=0,l=children.length;i<l;i++) {
            child = children[i];
            if(child.tagName.toLowerCase() === 'mtk-cps-collection-li')
                allowedParents.add(child);
        }

        if(allowedParents.has(element))
            current = element.firstChild;
        else
            current = element;

        do {
            if(allowedTags.has(current.tagName) && allowedParents.has(current.parentElement))
                return current;
        } while((current = current.parentElement));
        return undefined;
    }

    // This was not touched, but it is very application specific
    // note the angularJS usage and the expectation of `index` at the isolateScope!
    // MAYBE we could set index to a neutral place, like "data-index" attribute?
    // right now every directives scope has `index`, so, that may be OK so far
    function getTargetIndex(event, target) {
        var targetIndex = angular.element(target).isolateScope().index
          , insertBefore = true
          , elementBBox = target.getBoundingClientRect()
          , elementHeight = elementBBox.bottom - elementBBox.top
          , tippingPointY =  elementBBox.top + elementHeight / 2
          ;

        if (event.clientY > tippingPointY)
            insertBefore = false;
        return [targetIndex, insertBefore];
    }

    // this almost not touched when copied from propertyDict-directive
    // if we don't find target, insertPosition is now null instead of append
    function getTargetData(element, event, dropElementTags) {
        var target = findElement(event.target, dropElementTags, element) || null
          , targetIndexData
          , index = null
          , insertPosition = null
          ;
        if(target) {
            targetIndexData = getTargetIndex(event, target);
            index = targetIndexData[0];
            insertPosition = targetIndexData[1] ? 'before' : 'after';
        }
        return {
            index: index
          , insertPosition: insertPosition
          , element: target
        };
    }

    function CollectionDropDirective(dragDataService, dragIndicatorService) {
        function link(_scope, element, attrs) {
                // should be possibly be done with some configuration.
            var scope = element.isolateScope()
              , controller = scope.controller
              , container = element[0]
              , indicatorId = 'cps-drop-indicator'
              , dataTypes = ['cps/rule', 'cps/namespace-collection'
                           , 'cps/import', 'cps/comment']
              , dropElementTags = ['mtk-cps-rule', 'mtk-cps-namespace-collection'
                                 /*, 'mtk-cps-import'*/, 'mtk-cps-comment']
              ;

            element.on('dragover', function (event) {
                var dataEntry
                  , data
                  , target
                  , indicatorReference
                  , indicatorInsertPosition
                  , i, l
                  ;

                if(event.defaultPrevented)
                    // someone below already accepted the drag
                    return;

                dataEntry = dragDataService.getFirst(dataTypes);

                if(!dataEntry) {
                    dragIndicatorService.hideIndicator(indicatorId);
                    return;
                }

                // figure out where to drop and move an indicator to there
                data = dataEntry.payload;

                if(!controller.empty)
                    target = getTargetData(element[0], event, dropElementTags);
                else
                    target = {
                        index: 0
                      , insertPosition: 'before'
                      , element: container
                    };

                if(!target.insertPosition
                        || !controller.acceptMoveCPSElement(data[0], data[1], target.index, target.insertPosition)) {
                    // hide the indicator if this is an identity-dragover...
                    dragIndicatorService.hideIndicator(indicatorId);
                    return;
                }

                // place the indicator:
                indicatorReference = target.element;
                indicatorInsertPosition = controller.empty ? 'append' : target.insertPosition
                // indicatorInsertPosition is "before" or "after" or "append"
                dragIndicatorService.insertIndicator(indicatorId, indicatorReference, indicatorInsertPosition);

                // accepted
                event.preventDefault();//important
                event.dataTransfer.dropEffect = 'move';
            });

            element.on('drop', function(event) {
                var dataEntry = dragDataService.getFirst(dataTypes)
                  , data
                  , sourcePropertyDict
                  , sourceIndex
                  , target
                  ;

                if(!dataEntry)
                    return;

                data = dataEntry.payload;

                if(!controller.empty)
                    target = getTargetData(element[0], event, dropElementTags);
                else
                    target = {
                        index: 0
                      , insertPosition: 'before'
                      , element: container
                    };

                // don't accept if this is an identity-drop...
                if(!target.insertPosition
                        || !controller.acceptMoveCPSElement(data[0], data[1], target.index, target.insertPosition))
                    return;

                event.preventDefault();
                sourcePropertyDict = data[0];
                sourceIndex = data[1];

                // If the drag item is removed from the DOM by this drop
                // (it is for moves), we don't get a dragend event. So
                // this needs to clean up as well.
                // Making the execution of the move async would also help.
                dragDataService.remove(dataEntry.type);

                controller.moveCPSElement(sourcePropertyDict, sourceIndex, target.index, target.insertPosition);
            });
        }

        return {
            restrict: 'A' // only matches element names
          , link:link
        };
    }
    CollectionDropDirective.$inject = ['dragDataService', 'dragIndicatorService'];
    return CollectionDropDirective;
});
