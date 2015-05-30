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

    function findParentElement(element, tagName, includeInitialElement, parentLimit) {
        var current = includeInitialElement
            ? element
            : element.parentElement
          , _tagName = tagName.toUpperCase()
          ;
        do {
            // don't search above this element
            if(parentLimit && current === parentLimit)
                return undefined;
            if(current.tagName === _tagName)
                return current;
            current = current.parentElement;
        } while(current);
        return undefined;
    }

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
          , insertPosition
          ;
        if(target) {
            targetIndexData = getTargetIndex(event, target);
            index = targetIndexData[0];
            insertPosition = targetIndexData[1] ? 'before' : 'after';
        }
        else {
            // If no target was found, the drag should just append the
            // property. if that feels bad we could test if we find out
            // if we rather should prepend;
            // It's not as easy to display the indicator here!
            insertPosition = 'append';
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
                var dataEntry = dragDataService.getFirst(dataTypes)
                  , data
                  , target
                  , indicatorReference
                  , i, l
                  ;
                if(!dataEntry) {
                    dragIndicatorService.hideIndicator(indicatorId);
                    return;
                }

                data = dataEntry.payload;

                // figure out where to drop and move an indicator to there
                target = getTargetData(element[0], event, dropElementTags);

                if(!controller.acceptMoveProperty(data[0], data[1], target.index, target.insertPosition)) {
                    // hide the indicator if this is an identity-dragover...
                    dragIndicatorService.hideIndicator(indicatorId);
                    return;
                }

                // place the indicator:
                indicatorReference = (target.insertPosition === 'append')
                        ? theList
                        : findParentElement(target.element, 'li', false, theList)
                        ;
                // insertPosition is "before" "after" or "append"
                dragIndicatorService.insertIndicator(indicatorId, indicatorReference, target.insertPosition);

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

                target = getTargetData(element[0], event, dropElementTags);

                // don't accept if this is an identity-drop...
                if(!controller.acceptMoveProperty(sourcePropertyDict, sourceIndex, target.index, target.insertPosition))
                    return;

                event.preventDefault();
                sourcePropertyDict = data[0];
                sourceIndex = data[1];

                // If the drag item is removed from the DOM by this drop
                // (it is for moves), we don't get a dragend event. So
                // this needs to clean up as well.
                // Making the execution of the move async would also help.
                dragDataService.remove(dataEntry.type);

                controller.moveProperty(sourcePropertyDict, sourceIndex, target.index, target.insertPosition);
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
