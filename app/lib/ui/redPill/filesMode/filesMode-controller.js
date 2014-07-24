define([], function() {
    "use strict";
    function FilesModeController($scope, getModelController) {
        this.$scope = $scope;
        this.$scope.name = 'filesMode'
        console.log('filesModeController', $scope.$parent.master)
        
        if($scope.$parent.data.modeData[$scope.$parent.data.mode] === undefined)
            $scope.$parent.data.modeData[$scope.$parent.data.mode] = {
                files: []
                
            }
        $scope.data = $scope.$parent.data.modeData[$scope.$parent.data.mode];
        $scope.modelController = getModelController($scope.$parent.master);
        
        $scope.editorOptions = {
            lineWrapping : true,
            lineNumbers: true,
            // readOnly: 'nocursor',
            mode: 'css',
        };
    }
    FilesModeController.$inject = ['$scope', 'getModelController'];
    var _p = FilesModeController.prototype;
    
    return FilesModeController;
})
