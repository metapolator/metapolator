define([
    'jquery'
], function(
    $
) {
    "use strict";
    function verticalDividerDirective() {
        return {
            restrict: 'E'
          , controller: 'VerticalDividerController'
          , replace: false
          , scope: {
                model: '=mtkModel'
            }
          , link : function(scope, element, attrs, ctrl) {
                
                var id = attrs.divider
                  , thisDivider = scope.model.dividers[id]
                  , screenWidth = 0
                  , screenParts = 0
                  , thisPosition = 0
                  , startAdd = null
                  , startMirror = null
                  , containmentLeft = 0
                  , containmentRight = 0;
                
                $( window ).resize(function() {
                    redraw();
                    setContainment();
                });
                
                scope.$watch('model.dividerTrigger', function() {
                    return redraw();
                }, true);
                
                redraw();
                setContainment();
                
                $(element).draggable({
                    axis : "x",
                    containment : [containmentLeft, 0, containmentRight, 0],
                    start : function() {
                        $("mtk-landscape").removeClass("transition");
                        if (thisDivider.side == "left") {
                            thisPosition = $(this).offset().left;
                        } else {
                            thisPosition = screenWidth - $(this).offset().left;
                        }
                        startAdd = thisPosition / screenWidth * screenParts;
                        if (thisDivider.mirror) {
                            startMirror = scope.model.panels[thisDivider.mirror].share;
                        }
                    },
                    drag : function() {
                        if (thisDivider.side == "left") {
                            thisPosition = $(this).offset().left;
                        } else {
                            thisPosition = screenWidth - $(this).offset().left;
                        }
                        var addShare = thisPosition / screenWidth * screenParts;
                        var subtractShare = screenParts - scope.model.panels[thisDivider.dead].share - addShare;
                        scope.model.panels[thisDivider.add].share = addShare;
                        scope.model.panels[thisDivider.subtract].share = subtractShare;
                        if (thisDivider.mirror) {
                            scope.model.panels[thisDivider.mirror].share = startMirror - (addShare - startAdd);
                        }
                        scope.model.totalPanelParts = getTotalParts();
                        scope.$apply();
                    },
                    stop : function() {
                        $("mtk-landscape").addClass("transition");
                    }
                });
                
                function setContainment () {
                    if (thisDivider.contain == "left") {
                        containmentLeft = thisDivider.limitMin;
                        containmentRight = thisDivider.limitMax;
                    } else {
                        containmentLeft = screenWidth - thisDivider.limitMax;
                        containmentRight = screenWidth - thisDivider.limitMin;
                    }
                }
                
                function redraw() {
                    screenWidth = $(window).outerWidth();
                    screenParts = getScreenParts();
                    $(element[0]).css('left', getPosition());
                }
                    
                function getPosition() {
                    var x = 0;
                    for (var i = thisDivider.position.length - 1; i >= 0; i--) {
                        var panelId = thisDivider.position[i];
                        x += scope.model.panels[panelId].share / screenParts * screenWidth;
                    }
                    return x;
                }
                
                function getTotalParts() {
                    var parts = 0;
                    for (var i = scope.model.panels.length - 1; i >= 0; i--) {
                        var panel = scope.model.panels[i];
                        parts += panel.share;
                    }
                    return parts;
                }
                
                function getScreenParts() {
                    return scope.model.panels[0].share + scope.model.panels[1].share + scope.model.panels[2].share;
                }
            }
        };
    }
    
    verticalDividerDirective.$inject = [];
    return verticalDividerDirective;
});
