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

    function findElement(element, tagName, parentLimit) {
        // first searches upwards, because that is supposed to be shorter and less ambigous;
        return findParentElement(element, tagName, true, parentLimit)
                            || element.getElementsByTagName(tagName)[0];

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

    function getTargetData(event, element) {
        var target = findElement(event.target, 'mtk-cps-property', element)
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
            // if we rather should append;
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
              , indicatorId = 'cps/property'
              ;

            element.on('dragover', function (event) {
                var data = dragDataService.get('cps/property')
                  , target
                  , indicatorReference
                  ;

                if(!data) {
                    dragIndicatorService.hideIndicator(indicatorId);
                    return;
                }

                // figure out where to drop and move an indicator to there
                target = getTargetData(event, element[0]);

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
                var data = dragDataService.get('cps/property')
                  , sourcePropertyDict
                  , sourceIndex
                  , target
                  ;
                if(!data)
                    return;

                target = getTargetData(event, element[0]);

                // don't accept if this is an identity-drop...
                if(!controller.acceptMoveProperty(sourcePropertyDict, sourceIndex, target.index, target.insertPosition))
                    return;

                event.preventDefault();
                sourcePropertyDict = data[0];
                sourceIndex = data[1];

                dragDataService.remove('cps/property');
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
