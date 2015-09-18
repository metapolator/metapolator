define([], function() {
    "use strict";
    function mousewheelDirective() {
        console.log('mousewheelDirective');
        return function (scope, element, attr, ctrl) {
            element.bind('DOMMouseScroll mousewheel onmousewheel', function(event) {
                scope.$apply(function () {
                    console.log('apply func');
                    scope.$eval(attr.mouseWheel);
//                    if (event.originalEvent.detail > 0) {
//                        // Add `up` to attrs.
//                        console.log('up');
//                        scope.$eval(attr.mouseWheel);
//                    } else if (event.originalEvent.detail > 0) {
//                        // Add `down` to attrs.
//                        console.log('down');
//                        scope.$eval(attr.mouseWheel);
//                    }
                });
            });
        };
    }
    mousewheelDirective.$inject = [];
    return mousewheelDirective;
});
