define([], function() {
    "use strict";
    function FileService($rootScope) {
        this.setLocalStorage = function(localStorage) {
            this.$scope.localStorage = localStorage;
        }
    
        this.setFilenames = function(filenames) {
            this.$scope.filenames = filenames;
        }

        this.getFilenames = function() {
            return this.$scope.filenames;   
        }

        this.ready = function() {
            console.log('wtf');
            $rootScope.$broadcast('filesReady');
        }

    }
    
    FileService.$inject = ['$rootScope'];

    return FileService;
})
