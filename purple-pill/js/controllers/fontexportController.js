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

        function zero_padding(value){
            return value < 10 ? "0" + String(value) : String(value);
        }

        function get_timestamp(){
            var year, month, day, hours, minutes, seconds
              , date = new Date()
              ;
            year = zero_padding(date.getUTCFullYear());
            month = zero_padding(date.getUTCMonth());
            day = zero_padding(date.getUTCDate());
            hours = zero_padding(date.getUTCHours());
            minutes = zero_padding(date.getUTCMinutes());
            seconds = zero_padding(date.getUTCSeconds());

            return [year, month, day].join("") + "-" + [hours, minutes, seconds].join("");
        }

        var bundle = new $scope.data.stateless.JSZip()
          , bundleFolderName = "metapolator-export-" + get_timestamp()
          , bundle_filename = bundleFolderName + ".zip"
          , bundleFolder = bundle.folder(bundleFolderName)
          , message = "Exporting Zipped UFO fonts: " + bundle_filename
          ;
        $scope.data.alert(message, true);

        angular.forEach($scope.data.families, function(family) {
            angular.forEach(family.instances, function(instance) {
                if (instance.exportFont) {
                    var targetDirName = instance.displayName + ".ufo"
                      , filename = targetDirName + ".zip"
                      ;
                    var precision = -1 //no rounding
                      , zipped_data = $scope.data.stateful.project.getZippedInstance(
                                       instance.name, targetDirName, precision, "uint8array")
                      ;
                    bundleFolder.file(filename, zipped_data, {binary:true});
                }
            });
        });

        var bundle_data = bundle.generate({type:"blob"});
        $scope.data.stateless.saveAs(bundle_data, bundle_filename);
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
