app.controller("designSpaceController", function($scope) {
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

    $scope.sortableOptionsMasters = {
        cancel : '.no-drag, .drop-area',
        helper : 'clone',
        connectWith : '.drop-area',
        update : function(e, ui) {
            // exclude drop-area from normal sorting
            if (ui.item.sortable.droptarget.hasClass('drop-area')) {
                ui.item.sortable.cancel();
            }
        },
        stop : function(e, ui) {
            // push master to design space when dropped on drop-area
            if (ui.item.sortable.droptarget) {
                if (ui.item.sortable.droptarget.hasClass('drop-area')) {
                    // check which master is dropped
                    var sequenceIndex = ui.item.parent().parent().index();
                    var masterIndex = ui.item.index();
                    var master = $scope.sequences[sequenceIndex].masters[masterIndex];

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
                    }
                }
            }
        }
    };

    // masters panel
    $scope.sequences = [{
        name : "Weight",
        masters : [{
            fontFamily : 'Roboto',
            name : 'M1',
            weight : '100',
            display : true,
            edit : true
        }, {
            fontFamily : 'Roboto',
            name : 'M2',
            weight : '400',
            display : false,
            edit : true
        }, {
            fontFamily : 'Roboto',
            name : 'M3',
            weight : '700',
            display : true,
            edit : false
        }]
    }, {
        name : "Width",
        masters : [{
            fontFamily : 'Roboto Condensed',
            name : 'M4',
            weight : '400',
            display : true,
            edit : false
        }, {
            fontFamily : 'Roboto Condensed',
            name : 'M5',
            weight : '700',
            display : true,
            edit : false
        }]
    }, {
        name : "Slab",
        masters : [{
            fontFamily : 'Roboto Slab',
            name : 'M6',
            weight : '400',
            display : false,
            edit : false
        }, {
            fontFamily : 'Roboto Slab',
            name : 'M7',
            weight : '700',
            display : true,
            edit : false
        }]
    }];
});
