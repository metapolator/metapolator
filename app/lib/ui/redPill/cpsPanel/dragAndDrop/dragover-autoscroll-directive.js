define([
    'angular'
    ], function(
    angular
) {
    "use strict";

    function DragoverAutoscrollDirective() {
        function link(scope, element, attrs, controller) {
            var elem = element[0]
              , change
              , scrolling
              ;
            function scroll() {
                var window;
                if(!scrolling) return;
                elem.scrollTop = elem.scrollTop + change;
                window = elem.ownerDocument.defaultView;
                window.requestAnimationFrame(scroll);
            }
            function endScrolling(event) {
                scrolling = false;
            }

            //auto scrolling when a dragover bubbles here
            ['dragend','drop'].forEach(function(name) {
                element.on(name, endScrolling);
            });

            element[0].addEventListener('dragover', function autoscroll(event) {
                var start = false
                  , margin = 50
                  , speed = 20 // max pixels per iteration
                  , speedFactor
                  , elementBBox = elem.getBoundingClientRect()
                  ;
                if(event.clientY > elementBBox.top
                                && (event.clientY - margin) <= elementBBox.top) {
                    speedFactor = 1 - (event.clientY - elementBBox.top) / margin;
                    change = - speedFactor * speed;
                    start = !scrolling;
                    scrolling = true;
                }
                else if(event.clientY < elementBBox.bottom
                                && (event.clientY + margin) >= elementBBox.bottom) {
                    speedFactor = 1 - (elementBBox.bottom - event.clientY) / margin;
                    change = speedFactor * speed;
                    start = !scrolling;
                    scrolling = true;
                }
                else
                    scrolling = false;
                if(start && scrolling)
                    scroll();
            });
        }

        return {
            restrict: 'A' // only matches attribute names
          , link:link
        };
    }
    DragoverAutoscrollDirective.$inject = [];
    return DragoverAutoscrollDirective;
});
