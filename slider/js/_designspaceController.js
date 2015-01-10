app.controller('designspaceController', function($scope, $http, sharedScope) {
    $scope.data = sharedScope.data;

    $scope.designSpaces = [{
        name : "Space 1",
        type : "Control",
        masters : [],
        axes : [],
        triangle : false
    }];

    $scope.currentDesignSpace = 0;
    
    $scope.selectDesignSpace = function(i) {
        $scope.currentDesignSpace = i;
    }
    $scope.addDesignSpace = function() {
        var i = $scope.designSpaces.length;
        $scope.designSpaces.push({
            name : "Space " + (i + 1),
            type : "x",
            masters : [],
            axes : [],
            triangle : false
        });
        $scope.currentDesignSpace = i;
    }
    
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

    $scope.sortableOptionsMasters = {
        cancel : '.no-drag, .drop-area',
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

                if ($scope.designSpaces[$scope.currentDesignSpace].masters.indexOf(master) > -1) {
                    alert("master already in this Design Space");
                } else {
                    
                    if ($scope.designSpaces[$scope.currentDesignSpace].type == "Control") {
                        $scope.designSpaces[$scope.currentDesignSpace].masters.push(master);
                        if ($scope.designSpaces[$scope.currentDesignSpace].masters.length > 1) {
                            $scope.designSpaces[$scope.currentDesignSpace].axes.push({
                                m1: $scope.designSpaces[$scope.currentDesignSpace].axes.length,
                                m2: ($scope.designSpaces[$scope.currentDesignSpace].axes.length + 1),
                                value: 50
                            });
                        }
                    }
                    
                    else if ($scope.designSpaces[$scope.currentDesignSpace].type == "Explore") {
                        // get relative mouse position of where dropped
                        var mouseX = e.clientX - Math.round($(".drop-area").offset().left) - 10;
                        var mouseY = e.clientY - Math.round($(".drop-area").offset().top) - 10;
                        $scope.designSpaces[$scope.currentDesignSpace].masters.push({
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
});
