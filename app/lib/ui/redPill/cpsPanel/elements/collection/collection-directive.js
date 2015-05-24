define([
    'require/text!./collection.tpl'
    ], function(
    template
) {
    "use strict";


    function CollectionDirective() {
        function link(scope, element, attrs) {
            var elem = element[0]
              , change
              , scrolling
              ;
            function scroll() {
                if(!scrolling) return;
                elem.scrollTop = elem.scrollTop + change;
                window.requestAnimationFrame(scroll);

            }
            function endScrolling(event) {
                scrolling = false;
            }

            if(element.hasClass('root')){
                // this is a root collection, implement auto scrolling when
                // a dragover bubbles here


                ['dragend','drop'].forEach(function(name){
                    element.on(name, endScrolling);
                });

                element.on('dragover', function autoscroll(event) {
                    var start = false
                      , margin = 50
                      , speed = 20
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
        }


        return {
            restrict: 'E' // only matches element names
          , controller: 'CollectionController'
          , replace: false
          , template: template
          , scope: { cpsCollection: '=' }
          , link:link
        };
    }
    CollectionDirective.$inject = [];
    return CollectionDirective;
});
