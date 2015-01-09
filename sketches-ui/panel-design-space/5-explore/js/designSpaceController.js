app.controller("designSpaceController", function($scope) {
    $scope.designSpaces = [{
        name : "Space 1",
        type : "Explore",
        masters : [],
        axes : []
    }];

    $scope.selectedDesignSpaces = $scope.designSpaces[0];
    $scope.selectDesignSpace = function(i) {
        $scope.selectedDesignSpaces = i;
    }
    $scope.addDesignSpace = function() {
        var i = $scope.designSpaces.length;
        $scope.designSpaces.push({
            name : "Space " + (i + 1),
            type : "x",
            masters : [],
            axes : []
        });
        $scope.selectedDesignSpaces = $scope.designSpaces[i];
    }

    $scope.sortableOptionsMasters = {
        cancel : '.no-drag',
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

                    if ($scope.selectedDesignSpaces.masters.indexOf(master) > -1) {
                        alert("master already in this Design Space");
                    } else {
                        // get relative mouse position of where dropped
                        var mouseX = e.clientX - Math.round($(".drop-area").offset().left) - 10;
                        var mouseY = e.clientY - Math.round($(".drop-area").offset().top) - 10;
                        $scope.selectedDesignSpaces.masters.push({
                            master : master,
                            coordinates: [mouseX, mouseY]
                        });
                        $scope.selectedDesignSpaces.axes.push(50);
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
            name : 'Light',
            weight : '100',
            display : true,
            edit : true
        }, {
            fontFamily : 'Roboto',
            name : 'Regular',
            weight : '400',
            display : false,
            edit : true
        }, {
            fontFamily : 'Roboto',
            name : 'Bold',
            weight : '700',
            display : true,
            edit : false
        }]
    }, {
        name : "Width",
        masters : [{
            fontFamily : 'Roboto Condensed',
            name : 'Condensed',
            weight : '400',
            display : true,
            edit : false
        }, {
            fontFamily : 'Roboto Condensed',
            name : 'Cond. bold',
            weight : '700',
            display : true,
            edit : false
        }]
    }, {
        name : "Slab",
        masters : [{
            fontFamily : 'Roboto Slab',
            name : 'Slab',
            weight : '400',
            display : false,
            edit : false
        }, {
            fontFamily : 'Roboto Slab',
            name : 'Slab bold',
            weight : '700',
            display : true,
            edit : false
        }]
    }];
});
