define([], function() {
    "use strict";
    function FileService($rootScope) {
        this.fileName;
    
        this.setFilename = function(filename) {
            if (filename.indexOf('.zip') > 0){
                filename = filename.replace('.zip','');   
            }
            this.filename = filename;
        }

        this.getFilename = function() {
            return this.filename;   
        }

        this.ready = function() {
            $rootScope.$broadcast('filesReady');
        }

    }
    
    FileService.$inject = ['$rootScope'];

    return FileService;
})
