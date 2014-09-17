app.controller("MetapolatorController", function($scope) {'use strict';

    $scope.specimen = {
        text : "Freude, schöner Götterfunken, Tochter aus Elysium",
        fontSize : 60,
        lineHeight: 60
    };

    $scope.sequences = [{
        name : "Weight",
        sortOrder : 0,
        masters : [{
            fontFamily : 'Roboto',
            name : 'we-Light',
            weight : '100',
            display : true
        }, {
            fontFamily : 'Roboto',
            name : 'we-Regular',
            weight : '400',
            display : true
        }, {
            fontFamily : 'Roboto',
            name : 'we-Bold',
            weight : '700',
            display : true
        }]
    }, {
        name : "Width",
        sortOrder : 1,
        masters : [{
            fontFamily : 'Roboto Condensed',
            name : 'w-Regular',
            weight : '400',
            display : true
        }, {
            fontFamily : 'Roboto Condensed',
            name : 'w-Bold',
            weight : '700',
            display : true
        }]
    }, {
        name : "Slab",
        sortOrder : 2,
        masters : [{
            fontFamily : 'Roboto Slab',
            name : 's-Regular',
            weight : '400',
            display : false
        }, {
            fontFamily : 'Roboto Slab',
            name : 's-Bold',
            weight : '700',
            display : true
        }]
    }];

    $scope.adjustmentMasters = [{
        fontFamily : 'Droid sans mono',
        name : '',
        weight : '400'
    }, {
        fontFamily : 'Lato',
        name : '',
        weight : '900'
    }];

    $scope.mastersInView = [];
    $scope.adjustmentMastersInView = [];

    $scope.addMaster = function() {
        if (!$scope.newMaster.fontFamily.length) {
            return;
        }
        $scope.masters.push({
            fontFamily : $scope.newMaster.fontFamily,
            name : $scope.newMaster.name,
            weight : $scope.newMaster.weight
        });

        $scope.newMaster = '';
    };
    $scope.newMaster = {
        fontFamily : '',
        name : '',
        weight : ''
    };

    $scope.addAdjustmentMaster = function() {
        if (!$scope.newAdjustmentMaster.fontFamily.length) {
            return;
        }
        $scope.adjustmentMasters.push({
            fontFamily : $scope.newAdjustmentMaster.fontFamily,
            name : $scope.newAdjustmentMaster.name,
            weight : $scope.newAdjustmentMaster.weight
        });

        $scope.newAdjustmentMaster = '';
    };
    $scope.newAdjustmentMaster = {
        fontFamily : '',
        name : '',
        weight : ''
    };

    $scope.sortableOptions = {
        connectWith : ".master-ul",
        cancel : ".selectable-ag"
    };

});
