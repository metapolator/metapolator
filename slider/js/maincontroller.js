app.controller("MetapolatorController", function($scope){
	
	$scope.specimen = "Trittst im Morgenrot daher, Seh' ich dich im Strahlenmeer.";
	$scope.masters = [
        {
            fontFamily: 'Lato',
            weight: '100'
        },
        {
            fontFamily: 'Lato',
            weight: '300'
        },
        {
            fontFamily: 'Lato',
            weight: '400'
        },
        {
            fontFamily: 'Lato',
            weight: '700'
        }
	];
	
	$scope.adjustmentMasters = [
		{
            fontFamily: 'Lato',
            name: 'adj. 1',
            weight: '100'
		},
		{
            fontFamily: 'Lato',
            name: 'adj. 2',
            weight: '100'
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



});
