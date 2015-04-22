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

    $scope.data.exportFonts = function() {
        angular.forEach($scope.data.families, function(family) {
            angular.forEach(family.instances, function(instance) {
                if (instance.exportFont) {
                    var targetDirName = instance.displayName + ".ufo"
                      , filename = targetDirName + ".zip"
                      , message = "Exporting Zipped UFO font: " + filename
                      ;
                    $scope.data.alert(message, true);
                    var precision = -1//no rounding
                      , zipped_data = $scope.data.stateful.project.getZippedInstance(
                                       instance.name, targetDirName, precision, "blob")
                      ;
                    $scope.data.stateless.saveAs(zipped_data, filename);
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
