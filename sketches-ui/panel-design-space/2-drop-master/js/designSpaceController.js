app.controller("designSpaceController", function($scope) {
    $scope.designSpaces = [{
        name : "Space 1",
        type : "Control",
        masters : []
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
            masters : []
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
            console.log(ui.item);
            if (ui.item.sortable.droptarget.hasClass('drop-area')) {
                var sequenceIndex = ui.item.parent().parent().index();
                var masterIndex = ui.item.index();
                var master = $scope.sequences[sequenceIndex].masters[masterIndex];

                if ($scope.selectedDesignSpaces.masters.indexOf(master) > -1) {
                    alert("master already in this Design Space");
                } else {
                    $scope.selectedDesignSpaces.masters.push(master);
                    $scope.$apply();
                }
            }
        }
    };

    // masters panel
    $scope.sequences = [{
        name : "Weight",
        masters : [{
            fontFamily : 'Roboto',
            name : 'we-Light',
            weight : '100',
            display : true,
            edit : true
        }, {
            fontFamily : 'Roboto',
            name : 'we-Regular',
            weight : '400',
            display : false,
            edit : true
        }, {
            fontFamily : 'Roboto',
            name : 'we-Bold',
            weight : '700',
            display : true,
            edit : false
        }]
    }, {
        name : "Width",
        masters : [{
            fontFamily : 'Roboto Condensed',
            name : 'w-Regular',
            weight : '400',
            display : true,
            edit : false
        }, {
            fontFamily : 'Roboto Condensed',
            name : 'w-Bold',
            weight : '700',
            display : true,
            edit : false
        }]
    }, {
        name : "Slab",
        masters : [{
            fontFamily : 'Roboto Slab',
            name : 's-Regular',
            weight : '400',
            display : false,
            edit : false
        }, {
            fontFamily : 'Roboto Slab',
            name : 's-Bold',
            weight : '700',
            display : true,
            edit : false
        }]
    }];
});
