define([], function() {
    "use strict";
    function FileService($rootScope) {
        this.fileName;
        this.newFile;
    
        this.setFilename = function(filename) {
            if (filename.indexOf('.zip') > 0){
                filename = filename.replace('.zip','');   
            }
            this.filename = filename;
            this.newFile = true;
        }

        this.getFilename = function() {
            return this.filename;   
        }

        this.ready = function() {
            $rootScope.$broadcast('filesReady');
        }
        
        this.isNewFile = function() {
            var returnVal = this.newFile;
            this.newFile = false;
            return returnVal;
        }

    }
    
    FileService.$inject = ['$rootScope'];

    return FileService;
})
