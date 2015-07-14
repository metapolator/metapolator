define([
    'angular'
  , 'errors'
  , 'require/text!./propertyDict.tpl'
    ], function(
    angular
  , errors
  , template
) {
    "use strict";

    function findParentElement(element, tagNames, includeInitialElement, parentLimit) {
        var current = includeInitialElement
            ? element
            : element.parentElement
          // _tagNames is a Set of the `tagNames` argument, cast to upper case
          , _tagNames = new Set(// a typed Set::string would be cool here to detect bogus input
                (tagNames instanceof Array
                        ? tagNames
                        // if it was just one name, make it an array
                        : [tagNames]
                ).map(function(s){return s.toUpperCase();})
            )
          ;
        do {
            // don't search above this element
            if(parentLimit && current === parentLimit)
                return undefined;
            if(_tagNames.has(current.tagName))
                return current;
            current = current.parentElement;
        } while(current);
        return undefined;
    }

    /**
     * Find the highest distinct/unambigous parent of element then get the
     * actual child which has one of the tags in dropElementTags.
     * This has the advantage, that also the unambigous parent element
     * counts as a drag over the actual element, not only the children.
     * This is very specific for the structure of the directive. You change
     * the template, this breaks. This breaks, drag and drop behaves wrong.
     */
    function findElement(element, dropElementTags, parentLimit) {
        // This assumes that the structure is an <li>
        // of which the direct child is one of dropElementTags
        // everything above li is has many possible drop targets.
        var li = findParentElement(element, 'li', true, parentLimit)
          , i, l, child
          , needles = new Set(dropElementTags.map(function(s){return s.toUpperCase();}))
          ;
        if(!li)
            return undefined;

        // The li may contain many children, but I expect it to have just one.
        for(i=0,l=li.children.length;i<l;i++) {
            child = li.children[i];
            if(needles.has(child.tagName))
                return child;
        }
        return undefined;
    }

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

    function PropertyDictDirective(dragDataService, dragIndicatorService) {

        function link(scope, element, attrs, controller) {
            // there is also a dragenter and dragleave event, but they
            // are not necessary for the most simple usage
            var theList = element[0].getElementsByTagName('ol')[0]
              , indicatorId = 'cps-drop-indicator'
              , dataTypes = ['cps/property', 'cps/comment']
              , dropElementTags = ['mtk-cps-property', 'mtk-cps-comment']
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

                data = dataEntry.payload;

                if(!controller.empty)
                    target = getTargetData(element[0], event, dropElementTags);
                else
                    target = {
                        index: 0
                      , insertPosition: 'before'
                      , element: theList
                    };

                if(!target.insertPosition
                        || !controller.acceptMoveCPSElement(data[0], data[1], target.index, target.insertPosition)) {
                    // hide the indicator if this is an identity-dragover...
                    dragIndicatorService.hideIndicator(indicatorId);
                    return;
                }

                // place the indicator:
                indicatorReference = controller.empty
                    ? target.element
                    : findParentElement(target.element, 'li', false, theList)
                    ;
                indicatorInsertPosition = controller.empty ? 'append' : target.insertPosition
                // insertPosition is "before" or "after" or "append"
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
                      , element: theList

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
            restrict: 'E' // only matches element names
          , controller: 'PropertyDictController'
          , replace: false
          , template: template
          , scope: { cpsPropertyDict: '=' }
          , bindToController: true
          , controllerAs: 'controller'
          , link: link
        };
    }
    PropertyDictDirective.$inject = ['dragDataService', 'dragIndicatorService'];
    return PropertyDictDirective;
});
