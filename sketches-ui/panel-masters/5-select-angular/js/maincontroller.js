app.controller("MetapolatorController", function($scope) {

    $scope.dblClick = false;
    $scope.mouseDown = false;
    $scope.commandDown = false;
    $scope.controlDown = false;
    $scope.shiftDown = false;
    $scope.start = 0;
    $scope.end
    $scope.sortableOptions = {
        helper : 'clone'
    };

    $(window).keydown(function(e) {
        if (e.metaKey) {
            $scope.commandDown = true;
        }
        if (e.shiftKey) {
            $scope.shiftDown = true;
        }
        if (e.ctrlKey) {
            $scope.controlDown = true;
        }
    });

    $(window).keyup(function(e) {
        $scope.commandDown = false;
        $scope.controlDown = false;
        $scope.shiftDown = false;
    });

    $scope.selectMastersForEdit = function(thisMaster, nr) {
        if ($scope.commandDown || $scope.controlDown) {// toggle on ctrl click
            thisMaster.edit = !thisMaster.edit;
            $scope.start = nr;
        } else if ($scope.shiftDown) {// set end for shift click
            $scope.end = nr;
            $scope.selectSet();
        } else {// clean click clears all but current
            $scope.start = nr;
            angular.forEach($scope.masters, function(master) {
                master.edit = false;
            });
            thisMaster.edit = true;
        }
    }

    $scope.selectSet = function() {
        var countstart, countend;
        angular.forEach($scope.masters, function(master) {
            master.edit = false;
        });
        if ($scope.start > $scope.end) {// switch start and end for the loop
            countstart = $scope.end;
            countend = $scope.start + 1;
        } else {
            countstart = $scope.start;
            countend = $scope.end + 1;
        }
        for (var i = countstart; i < countend; i++) {
            $scope.masters[i].edit = true;
        }
    }
    // masters panel
    $scope.masters = [{
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
    }, {
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
    }, {
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
    }];
});
