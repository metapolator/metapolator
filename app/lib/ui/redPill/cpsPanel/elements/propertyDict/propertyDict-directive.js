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

    function PropertyDictDirective(dragDataService, dragIndicatorService) {

        function link(scope, element, attrs) {
            // there is also a dragenter and dragleave event, but they
            // are not necessary for the most simple usage
            var theList = element[0].getElementsByTagName('ol')[0];

            // maybe we rather find this on every event then.
            var targetIndex, insertPosition, indicatorId = 'cps/property';

            element.on('dragover', function (event) {
                var dragDataKey = event.dataTransfer.getData('cps/property')
                  , data
                  , target
                  , targetIndexData
                  , indicatorElement
                  ;
                if(!dragDataKey) {
                    // hide the indicator if this is an identity-dragover...
                    dragIndicatorService.hideIndicator(indicatorId);
                    return;
                }

                // figure out where to drop and move an indicator to there
                target = findElement(event.target, 'mtk-cps-property', element[0]);
                if(target) {
                    targetIndexData = getTargetIndex(event, target);
                    targetIndex = targetIndexData[0];
                    insertPosition = targetIndexData[1] ? 'before' : 'after';
                }
                else {
                    // If no target was found, the drag should just append the
                    // property. if that feels bad we could test if we find out
                    // if we rather should append;
                    // It's not as easy to display the indicator here!
                    targetIndex = scope.cpsPropertyDict.length;
                    insertPosition = 'append';
                }


                data = dragDataService.get(dragDataKey)
                if(!scope.acceptMoveProperty(data[0], data[1], targetIndex, insertPosition)) {
                    // hide the indicator if this is an identity-dragover...
                    dragIndicatorService.hideIndicator(indicatorId);
                    return;
                }
                // place the indicator:
                indicatorElement = (insertPosition === 'append')
                        ? theList
                        : findParentElement(target, 'li', false, theList)
                        ;

                // insertPosition is "before" "after" or "append"
                dragIndicatorService.insertIndicator(indicatorId, indicatorElement, insertPosition);


                // accepted
                event.preventDefault();//important
                event.dataTransfer.dropEffect = 'move';
            });

            element.on('drop', function(event) {
                var dragDataKey = event.dataTransfer.getData('cps/property');
                if(!dragDataKey)
                    return;

                event.preventDefault();

                var data = dragDataService.get(dragDataKey)
                  , sourcePropertyDict = data[0]
                  , sourceIndex = data[1]
                  ;
                // don't accept if this is an identity-drop...
                if(!scope.acceptMoveProperty(sourcePropertyDict, sourceIndex, targetIndex, insertPosition))
                    return;

                dragDataService.remove(dragDataKey);
                errors.assert(targetIndex !== undefined, '"targetIndex" should be known at this point.');
                scope.moveProperty(sourcePropertyDict, sourceIndex, targetIndex, insertPosition);
            });
        }


        return {
            restrict: 'E' // only matches element names
          , controller: 'PropertyDictController'
          , replace: false
          , template: template
          , scope: { cpsPropertyDict: '=' }
          , link: link
        };
    }
    PropertyDictDirective.$inject = ['dragDataService', 'dragIndicatorService'];
    return PropertyDictDirective;
});
