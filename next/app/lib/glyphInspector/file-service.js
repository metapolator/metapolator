define([], function() {
    "use strict";
    function FileService($scope, localStorage, fileNames) {
        this.$scope = $scope;
        this.$scope.name = 'FileService';
        this.$scope.localStorage;
        this.$scope.filenames = fileNames;
        this.filesReady();
    }
    
    FileService.$inject = ['$scope', '$rootScope'];
    var _p = FileService.prototype;
    
    _p.setLocalStorage = function(localStorage) {
        this.$scope.localStorage = localStorage;
    }
    
    _p.setFilenames = function(filenames) {
        this.$scope.filenames = filenames;
    }
    
    _p.getFilenames = function() {
        return this.$scope.filenames;   
    }
    
    _p.filesReady = function() {
        $rootScope.$broadcast('filesReady');
    }
    
    
    return FileService;
})
