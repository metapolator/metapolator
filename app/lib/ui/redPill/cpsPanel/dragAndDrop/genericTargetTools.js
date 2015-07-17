define([
    'angular'
    ], function(
    angular
) {
    "use strict";

    // Note the angularJS usage and the expectation of `index` at the isolateScope!
    // MAYBE we could set index to a neutral place, like "data-index" attribute?
    // Right now every directives scope has `index`, so, that may be OK so far
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

    function getTargetData(findElement, element, event) {
        var target = findElement(event.target, element) || null
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
    return {
        getTargetIndex: getTargetIndex
      , getTargetData: getTargetData
    };
});
