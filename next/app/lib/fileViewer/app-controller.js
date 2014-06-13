define([
	'bower_components/zip/zip',
	'models/FS'
], function(Zip,FS) {
	"use strict";
	function FileViewerController($scope, $rootScope, $compile) {
		this.$scope = $scope;
		this.$scope.name = 'FileViewer';
        this.$scope.selectedFile;
        this.$scope.$watch('selectedFile', function (newFile, oldFile) {
            if (newFile){
                this.$scope.selectedFileContent = localStorage.getItem(newFile);
            }
        }.bind(this));
	}
	
	FileViewerController.$inject = ['$scope', '$rootScope', '$compile'];
	var _p = FileViewerController.prototype;
    
    return FileViewerController;
})
