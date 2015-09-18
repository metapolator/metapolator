define([], function() {
    "use strict";
    function mousewheelDirective() {
        return function (scope, element, attr, ctrl) {
            element.bind('DOMMouseScroll mousewheel', function(event) {
                scope.$apply(function () {
                  // We just set a keyCode on the event
                  // So scrolling is actually arrow up and down.
                  if (event.originalEvent.detail > 0 || event.originalEvent.wheelDelta > 0) {
                    event.keyCode = 38;
                  } else {
                    event.keyCode = 40;
                  }
                  scope.$eval(attr.mtkMousewheel, {$event:event});
                });
            });
        };
    }
    mousewheelDirective.$inject = [];
    return mousewheelDirective;
});
