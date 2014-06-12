define([
	'bower_components/zip/zip',
	'models/FS'
], function(Zip,FS) {
	"use strict";
	function FileViewerController($scope) {
		this.$scope = $scope;
		this.$scope.name = 'FileViewer';
        $scope.$on('filesReady', function() {
            console.log('wtf');   
        });
	}
	
	FileViewerController.$inject = ['$scope'];
	var _p = FileViewerController.prototype;
    
    return FileViewerController;
})
