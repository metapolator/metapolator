app.controller("MetapolatorController", function($scope){
	
	$scope.specimen = {
		text: "Freude, schöner Götterfunken, Tochter aus Elysium",
		size: 100
	};
	
	$scope.masters = [
        {
        	id: 0,
            fontFamily: 'Lato',
            name: '',
            weight: '100'
        },
        {
        	id: 1,
            fontFamily: 'Lato',
            name: '',
            weight: '300'
        },
        {
        	id: 2,
            fontFamily: 'Lato',
            name: '',
            weight: '400'
        },
        {
        	id: 3,
            fontFamily: 'Lato',
            name: '',
            weight: '700'
        }
	];
	
	$scope.masterSequences = [
		[0, 1, 2, 3]
	
	];
	
	$scope.adjustmentMasters = [
		{
        	id: 0,
            fontFamily: 'Merriweather',
            name: 'adj. 1',
            weight: '300'
		},
		{
        	id: 1,
            fontFamily: 'Merriweather',
            name: 'adj. 2',
            weight: '700'
		}
	];
	
	$scope.instances = [
		{
            fontFamily: 'Droid sans mono',
            name: '',
            weight: '400'
		},
		{
            fontFamily: 'Lato',
            name: '',
            weight: '900'
		}
	];
	
	
	$scope.mastersInView = [];
	$scope.adjustmentMastersInView = [];
	
    $scope.addMaster = function () {
        if (!$scope.newMaster.fontFamily.length) {
            return;
        }
        $scope.masters.push({
            fontFamily: $scope.newMaster.fontFamily,
            name: $scope.newMaster.name,
            weight: $scope.newMaster.weight
        });

        $scope.newMaster = '';
    };
    $scope.newMaster = {
    	fontFamily: '',
    	name: '',
    	weight: ''	
    };

	
    $scope.addAdjustmentMaster = function () {
        if (!$scope.newAdjustmentMaster.fontFamily.length) {
            return;
        }
        $scope.adjustmentMasters.push({
            fontFamily: $scope.newAdjustmentMaster.fontFamily,
            name: $scope.newAdjustmentMaster.name,
            weight: $scope.newAdjustmentMaster.weight
        });

        $scope.newAdjustmentMaster = '';
    };
    $scope.newAdjustmentMaster = {
    	fontFamily: '',
    	name: '',
    	weight: ''	
    };

});
