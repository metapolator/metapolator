define([
    'jquery'
], function(
    $
) {
    'use strict';
    function verticalDividerDirective() {
        return {
            restrict: 'E'
          , controller: 'VerticalDividerController'
          , replace: false
          , scope: {
                dividers: '=mtkDividers'
              , panels: '=mtkPanels'
              , totalParts: '=mtkTotalParts'
            }
          , link : function(scope, element, attrs, ctrl) {
                var id = attrs.divider
                  , thisDivider = scope.dividers[id]
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
                    axis : 'x',
                    containment : [containmentLeft, 0, containmentRight, 0],
                    start : function() {
                        $('mtk-landscape').removeClass('transition');
                        if (thisDivider.side === 'left') {
                            thisPosition = $(this).offset().left;
                        } else {
                            thisPosition = screenWidth - $(this).offset().left;
                        }
                        startAdd = thisPosition / screenWidth * screenParts;
                        if (thisDivider.mirror) {
                            startMirror = scope.panels[thisDivider.mirror].share;
                        }
                    },
                    drag : function() {
                        if (thisDivider.side === 'left') {
                            thisPosition = $(this).offset().left;
                        } else {
                            thisPosition = screenWidth - $(this).offset().left;
                        }
                        var addShare = thisPosition / screenWidth * screenParts;
                        var subtractShare = screenParts - scope.panels[thisDivider.dead].share - addShare;
                        scope.panels[thisDivider.add].share = addShare;
                        scope.panels[thisDivider.subtract].share = subtractShare;
                        if (thisDivider.mirror) {
                            scope.panels[thisDivider.mirror].share = startMirror - (addShare - startAdd);
                        }
                        scope.totalPanelParts = getTotalParts();
                        scope.$apply();
                    },
                    stop : function() {
                        $('mtk-landscape').addClass('transition');
                    }
                });
                
                function setContainment () {
                    if (thisDivider.contain === 'left') {
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
                        x += scope.panels[panelId].share / screenParts * screenWidth;
                    }
                    return x;
                }
                
                function getTotalParts() {
                    var parts = 0;
                    for (var i = scope.panels.length - 1; i >= 0; i--) {
                        var panel = scope.panels[i];
                        parts += panel.share;
                    }
                    return parts;
                }
                
                function getScreenParts() {
                    return scope.panels[0].share + scope.panels[1].share + scope.panels[2].share;
                }
            }
        };
    }
    
    verticalDividerDirective.$inject = [];
    return verticalDividerDirective;
});
