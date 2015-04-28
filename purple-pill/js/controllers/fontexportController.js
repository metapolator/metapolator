app.controller('fontexportController', ['$scope', '$http', 'sharedScope', 'ngProgress', '$timeout',
function($scope, $http, sharedScope, ngProgress, $timeout) {
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

        //Do not trigger the export routine if no instance is selected for export,
        //otherwise it would result in an empty ZIP file.
        if (!$scope.data.instancesForExport())
            return;

        function zero_padding(value){
            return value < 10 ? "0" + String(value) : String(value);
        }

        function get_timestamp(){
            var year, month, day, hours, minutes, seconds
              , date = new Date()
              ;
            year = zero_padding(date.getFullYear());
            month = zero_padding(date.getMonth());
            day = zero_padding(date.getDate());
            hours = zero_padding(date.getHours());
            minutes = zero_padding(date.getMinutes());
            seconds = zero_padding(date.getSeconds());

            return [year, month, day].join("") + "-" + [hours, minutes, seconds].join("");
        }

        var bundle = new $scope.data.stateless.JSZip()
          , bundleFolderName = "metapolator-export-" + get_timestamp()
          , bundle_filename = bundleFolderName + ".zip"
          , bundleFolder = bundle.folder(bundleFolderName)
          , message = "Exporting Zipped UFO fonts: " + bundle_filename
          ;
        $scope.data.alert(message, true);

        ngProgress.setParent(document.getElementById("export-progressbar"));
        var container = ngProgress.getDomElement()[0];
        container.style.position = "absolute";
        container.style.top = "auto";
        container.style.bottom = "0px";
        ngProgress.height("20px");
        ngProgress.color("green");
        ngProgress.start();

        $timeout(function(){
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
        }, 1000).then(function(){
            var bundle_data = bundle.generate({type:"blob"});
            $scope.data.stateless.saveAs(bundle_data, bundle_filename);

            ngProgress.complete();
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

}]);
