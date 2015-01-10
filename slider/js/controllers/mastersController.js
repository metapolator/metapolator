app.controller("mastersController", function($scope, sharedScope) {'use strict';
    $scope.data = sharedScope.data;
    
    $scope.sortableOptions = {
        cancel : '.no-drag, .drop-area, .selectable-ag',
        helper : 'clone',
        connectWith : '.drop-area',
        sort: function(e, ui){ 
            if (IsOverDropArea(ui)) {
                $(".drop-area").addClass("drag-over");
            } else {
               $(".drop-area").removeClass("drag-over"); 
            }
        },
        update : function(e, ui) {
        },
        stop : function(e, ui) {
            // push master to design space when dropped on drop-area
             if (IsOverDropArea(ui)) {
                // check which master is dropped
                var sequenceIndex = ui.item.parent().parent().index();
                var masterIndex = ui.item.index();
                var master = $scope.data.sequences[sequenceIndex].masters[masterIndex];

                if ($scope.data.designSpaces[$scope.data.currentDesignSpace].masters.indexOf(master) > -1) {
                    alert("master already in this Design Space");
                } else {
                    
                    if ($scope.data.designSpaces[$scope.data.currentDesignSpace].type == "Control") {
                        $scope.data.designSpaces[$scope.data.currentDesignSpace].masters.push(master);
                        if ($scope.data.designSpaces[$scope.data.currentDesignSpace].masters.length > 1) {
                            $scope.data.designSpaces[$scope.data.currentDesignSpace].axes.push({
                                m1: $scope.data.designSpaces[$scope.data.currentDesignSpace].axes.length,
                                m2: ($scope.data.designSpaces[$scope.data.currentDesignSpace].axes.length + 1),
                                value: 50
                            });
                        }
                    }
                    
                    else if ($scope.data.designSpaces[$scope.data.currentDesignSpace].type == "Explore") {
                        // get relative mouse position of where dropped
                        var mouseX = e.clientX - Math.round($(".drop-area").offset().left) - 10;
                        var mouseY = e.clientY - Math.round($(".drop-area").offset().top) - 10;
                        $scope.data.designSpaces[$scope.data.currentDesignSpace].masters.push({
                            master : master,
                            coordinates : [mouseX, mouseY]
                        });
                    }
                    $scope.$apply();
                    $(".drop-area").removeClass("drag-over"); 
                }
            } else {
               $(".drop-area").removeClass("drag-over"); 
            }
        }
    };
    
    function IsOverDropArea (ui) {
        var dropLeft = $(".drop-area").offset().left;
        var dropRight = $(".drop-area").offset().left + $(".drop-area").outerWidth();
        var dropTop = $(".drop-area").offset().top;
        var dropBottom = $(".drop-area").offset().top + $(".drop-area").outerHeight();
        
        var thisLeft = ui.offset.left;
        var thisRight = ui.offset.left + ui.item.outerWidth();
        var thisTop = ui.offset.top;
        var thisBottom = ui.offset.top + ui.item.outerHeight();
        
        var marginHor = ui.item.outerWidth()/2;
        var marginVer = ui.item.outerHeight()/2;
        
        if (dropLeft < (thisLeft + marginHor) && dropRight > (thisRight - marginHor) && dropTop < (thisTop + marginVer) && dropBottom > (thisBottom - marginVer)) {
            return true;
        } else {
            return false;
        }
    }
});
