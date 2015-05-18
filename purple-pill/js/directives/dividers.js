app.directive('divider', function($document) {
    return {
        restrict : 'E',
        link : function(scope, element, attrs, ctrl) {
            var id = attrs.divider;
            var divider = scope.data.view.dividers[id]; 
            var screenWidth, screenParts, thisPosition;
            var startAdd, startMirror;
            var containmentLeft, containmentLeft;
            
            $( window ).resize(function() {
                redraw();
                setContainment();
            });
            
            scope.$watch('data.view.dividerTrigger', function(newVal) {
                return redraw();
            }, true);
            
            redraw();
            setContainment();
            
            $(element).draggable({
                axis : "x",
                containment : [containmentLeft, 0, containmentRight, 0],
                start : function() {
                    $("#landscape").removeClass("transition");
                    if (divider.side == "left") {
                        thisPosition = $(this).offset().left;
                    } else {
                        thisPosition = screenWidth - $(this).offset().left;
                    }
                    startAdd = thisPosition / screenWidth * screenParts;
                    if (divider.mirror) {
                        startMirror = scope.data.view.panels[divider.mirror].share;
                    }
                },
                drag : function() {
                    if (divider.side == "left") {
                        thisPosition = $(this).offset().left;
                    } else {
                        thisPosition = screenWidth - $(this).offset().left;
                    }
                    var addShare = thisPosition / screenWidth * screenParts;
                    var subtractShare = screenParts - scope.data.view.panels[divider.dead].share - addShare;
                    scope.data.view.panels[divider.add].share = addShare;
                    scope.data.view.panels[divider.subtract].share = subtractShare;
                    if (divider.mirror) {
                        mirrorShare = startMirror - (addShare - startAdd);
                        scope.data.view.panels[divider.mirror].share = mirrorShare;
                    }
                    scope.data.view.totalPanelParts = scope.data.getTotalParts();
                    scope.$apply();
                },
                stop : function() {
                    $("#landscape").addClass("transition");
                }
            });
            
            function setContainment () {
                if (divider.contain == "left") {
                    containmentLeft = divider.limitMin;
                    containmentRight = divider.limitMax;
                } else {
                    containmentLeft = screenWidth - divider.limitMax;
                    containmentRight = screenWidth - divider.limitMin;
                }
            }
            
            function redraw() {
                screenWidth = $(window).outerWidth();
                screenParts = getScreenParts();
                $(element[0]).css('left', getPosition());
                
                function getPosition() {
                    var x = 0;
                    angular.forEach(divider.position, function(panelId) {
                        x += scope.data.view.panels[panelId].share / screenParts * screenWidth;
                    });  
                    return x;
                }
                
                function getScreenParts() {
                    var parts = scope.data.view.panels[0].share + scope.data.view.panels[1].share + scope.data.view.panels[2].share;
                    return parts;
                }
            }

        }
    };
});
