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
                        startMirror = scope.data.view.panels[divider.mirror];
                    }
                },
                drag : function() {
                    if (divider.side == "left") {
                        thisPosition = $(this).offset().left;
                    } else {
                        thisPosition = screenWidth - $(this).offset().left;
                    }
                    var addShare = thisPosition / screenWidth * screenParts;
                    var subtractShare = screenParts - scope.data.view.panels[divider.dead] - addShare;
                    scope.data.view.panels[divider.add] = addShare;
                    scope.data.view.panels[divider.subtract] = subtractShare;
                    if (divider.mirror) {
                        mirrorShare = startMirror - (addShare - startAdd);
                        scope.data.view.panels[divider.mirror] = mirrorShare;
                    }
                    scope.data.view.totalPanelParts = getTotalParts();
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
            
            function getTotalParts() {
                var parts = 0;
                angular.forEach(scope.data.view.panels, function(panel) {
                    parts += panel;
                });  
                return parts;
            }
            
            
            function redraw() {
                screenWidth = $("body").outerWidth();
                screenParts = getScreenParts();
                $(element[0]).css('left', getPosition());
                
                function getPosition() {
                    var x = 0;
                    angular.forEach(divider.position, function(panelId) {
                        x += scope.data.view.panels[panelId] / screenParts * screenWidth;
                    });  
                    return x;
                }
                
                function getScreenParts() {
                    var parts = scope.data.view.panels[0] + scope.data.view.panels[1] + scope.data.view.panels[2];
                    return parts;
                }
            }

        }
    };
});
