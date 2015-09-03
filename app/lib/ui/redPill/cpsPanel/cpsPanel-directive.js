define([
    'require/text!./cpsPanel.tpl'
    ], function(
    template
) {
    "use strict";
    function CpsPanelDirective() {
        function link(scope, element, attrs, controller) {

            function setHeight() {
                /*jshint validthis: true*/
                this.setter = null;
                if(this.newHeight === null) return;
                this.element.style.height = this.newHeight + 'px';
                this.newHeight = null;
            }

            function changeHeight(event) {
                /*jshint validthis: true*/
                this.newHeight = this.startY - event.screenY + this.startHeight;
                if(!this.setter)
                    this.setter = document.defaultView.requestAnimationFrame(setHeight.bind(this));
            }

            function endResizeHeight(event) {
                /*jshint validthis: true*/
                this.element.ownerDocument.removeEventListener('mouseup', this.mouseup);
                this.element.ownerDocument.removeEventListener('mousemove', this.mousemove);

            }

            scope.resizeHeight = function(event) {
                var state = {
                    element: element[0]
                  , startHeight: element[0].clientHeight
                  , startY: event.screenY
                  , setter: null
                  , newHeight: null
                };
                state.mouseup = endResizeHeight.bind(state);
                state.mousemove = changeHeight.bind(state);

                element[0].ownerDocument.addEventListener('mouseup', state.mouseup);
                element[0].ownerDocument.addEventListener('mousemove', state.mousemove);
            };
        }
        return {
            restrict: 'E' // only matches element names
          , controller: 'CpsPanelController'
          , replace: false
          , template: template
          , scope: {}
          , link: link
        };
    }
    CpsPanelDirective.$inject = [];
    return CpsPanelDirective;
});
