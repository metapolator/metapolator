define([
    'jquery'
  , 'jquery-ui'
], function(
    $
  , jqueryUi
) {
    "use strict";
    function horizontalDividerDirective() {
        return {
            restrict: 'E',
            controller: 'HorizontalDividerController',
            replace: false,
            link : function(scope, element, attrs, ctrl) {
                var containmentBottom = null
                  , containmentTop = null
                  , containmentMargin = 60
                  , parentElement = null
                  , topElement = null
                  , bottomElement = null
                  , totalHeight = null;
                getElements();
                setValues();
                
                $(element[0]).draggable({
                    axis : "y",
                    containment : [0, containmentTop, 0, containmentBottom],
                    start : function() {
                        setValues();
                    },
                    drag : function() {
                        divideHorizontal(element[0]);
                    },
                    stop : function() {
                        divideHorizontal(element[0]);
                    }
                });
                
                function getElements() {
                    parentElement = $(element).parent();
                    topElement = $(element).prev();
                    bottomElement = $(element).next();
                }
                
                function setValues() {
                    var menuHeight = $("mtk-menubar").outerHeight();
                    containmentTop = containmentMargin + menuHeight;
                    containmentBottom = $("metapolator").outerHeight() - containmentMargin;
                    totalHeight = parentElement.outerHeight();
                }
                
                function divideHorizontal(element) {
                    var y = $(element).position().top;
                    topElement.outerHeight("calc(" + y / totalHeight + " * 100% + 5px)");
                    $(element).css("top", "calc(" + y / totalHeight + " * 100%)");
                    bottomElement.outerHeight("calc(" + (1 - (y / totalHeight)) + " * 100% - 5px)");
                }
            }
        };
    }
    
    horizontalDividerDirective.$inject = [];
    return horizontalDividerDirective;
});
