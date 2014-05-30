define([], function() {
    "use strict";
    function FileUploaderController($scope) {
        this.$scope = $scope;
        this.$scope.name = 'fileUploader';
        console.log('new', this, ':-)', this.$scope.name, this.$scope.model, this.$scope.$parent.name);
        this.requiredFeaturesAvailable();
    }
    
    FileUploaderController.$inject = ['$scope'];
    var _p = FileUploaderController.prototype;

    _p.requiredFeaturesAvailable = function(){
    	this.$scope.requiredFeaturesAvailable = (
    		!!window.File &&
    		!!window.FileReader &&
    		!!window.FileList &&
    		!!window.Blob &&
    		!!window.localStorage);
    }
    
    return FileUploaderController;
})
