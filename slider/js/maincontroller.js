app.controller("MetapolatorController", function($scope){
	
	$scope.specimen = "Trittst im Morgenrot daher, Seh' ich dich im Strahlenmeer.";
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
	
	
    $scope.adjustmentMaster = function () {
        if (!$scope.newAdjustmentMaster.length) {
            return;
        }
        $scope.adjustmentMasters.push({
            name: $scope.newAdjustmentMaster
        });

        $scope.newAdjustmentMaster = '';
    };
    $scope.newAdjustmentMaster = '';
    
    $scope.addMaster = function () {
        if (!$scope.newMaster.length) {
            return;
        }
        $scope.masters.push({
            name: $scope.newMaster
        });

        $scope.newMaster = '';
    };
    $scope.newMaster = '';



});
