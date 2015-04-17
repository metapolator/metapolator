app.controller('fontexportController', function($scope, $http, sharedScope) {
    $scope.data = sharedScope.data;

    $scope.checkAll = function() {
        angular.forEach($scope.data.families, function(family) {
            angular.forEach(family.instances, function(instance) {
                instance.exportFont = true;
            });
        }); 
        $scope.data.localmenu.fonts = false;
    };
    
    $scope.uncheckAll = function() {
        angular.forEach($scope.data.families, function(family) {
            angular.forEach(family.instances, function(instance) {
                instance.exportFont = false;
            });
        }); 
        $scope.data.localmenu.fonts = false;
    };
    
    $scope.data.exportFonts = function (){
        console.log("exporting");

        angular.forEach($scope.data.sequences, function(sequence) {
            angular.forEach(sequence.masters, function(master) {
                if (master.edit) {
                    angular.forEach($scope.data.families, function(family) {
                        angular.forEach(family.instances, function(instance) {
                            if (instance.exportFont) {
                                var filename = master.name + "_"+ instance.name + ".zip"
                                  , msg = "Exporting Zipped UFO font: " + filename;

                                $scope.data.alert(msg, true);
                                console.log(msg);

                                var precision = -1 //no rounding
                                  , zipped_data = $scope.data.stateful.project.getZippedInstance(
                                                  master.name, instance.name, precision, "blob");

                                console.log("zipped_data = " + zipped_data);
                                $scope.data.stateful.project.saveAs(zipped_data, filename);
                            }
                        });
                    });
                }
            });
        });
    };
    
    $scope.data.instancesForExport = function() {
        var instancesForExport = false;
        angular.forEach($scope.data.families, function(family) {
            angular.forEach(family.instances, function(instance) {
                if (instance.exportFont) {
                    instancesForExport = true;
                }
            });
        }); 
        return instancesForExport;
    };


});
