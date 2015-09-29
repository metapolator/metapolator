define([], function() {
    "use strict";
    function enterDirective() {
        return function (scope, element, attrs) {
            element.bind('keydown keypress', function (event) {
                // Stop the cursor from bouncing around.
                if (event.which === 38) {
                    event.preventDefault();
                }
                if (event.which === 13) {
                    scope.$apply(function () {
                        scope.$eval(attrs.ngEnter, {$event:event});
                    });
                event.preventDefault();
                }
            });
        };
    }
    enterDirective.$inject = [];
    return enterDirective;
});
