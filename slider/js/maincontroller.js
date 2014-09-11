app.controller("MetapolatorController", function($scope){
	
	$scope.specimen = {
		text: "Trittst im Morgenrot daher, Seh' ich dich im Strahlenmeer.",
		size: 100
	};
	
	$scope.masters = [
        {
            fontFamily: 'Lato',
            name: '',
            weight: '100'
        },
        {
            fontFamily: 'Lato',
            name: '',
            weight: '300'
        },
        {
            fontFamily: 'Lato',
            name: '',
            weight: '400'
        },
        {
            fontFamily: 'Lato',
            name: '',
            weight: '700'
        }
	];
	
	$scope.adjustmentMasters = [
		{
            fontFamily: 'Merriweather',
            name: 'adj. 1',
            weight: '300'
		},
		{
            fontFamily: 'Merriweather',
            name: 'adj. 2',
            weight: '700'
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
