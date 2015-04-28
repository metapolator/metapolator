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

        /*
        ngProgress.setParent(document.getElementById("export-progressbar"));
        var container = ngProgress.getDomElement()[0];
        container.style.position = "absolute";
        container.style.top = "auto";
        container.style.bottom = "0px";
        ngProgress.height("20px");
        ngProgress.color("green");
        ngProgress.start();
        */

/*
//Implementation using generators:

        function* exportFont_generator() {
            angular.forEach($scope.data.families, function(family) {
                angular.forEach(family.instances, function(instance) {
                    if (instance.exportFont){
                        var model = $scope.data.stateful.project.open(instance.name)
                          , glyphs = model.query('master#' + instance.name).children
                          , i, j
                          ;
                        for (i=0,j=glyphs.length; i<j; i++){
                            yield [model, glyphs[i]];
                        }
                    }
                });
            });
        }

        var gen = exportFont_generator()
          , glyph_counter = 0
          , total_glyphs = 0
          ;
        angular.forEach($scope.data.families, function(family) {
            angular.forEach(family.instances, function(instance) {
                if (instance.exportFont){
                    var model = $scope.data.stateful.project.open(instance.name)
                      , glyphs = model.query('master#' + instance.name).children
                      ;
                    total_glyphs += glyphs.length;
                }
            }
        }
*/

        var glyphs_for_cache = Array();
        angular.forEach($scope.data.families, function(family) {
            angular.forEach(family.instances, function(instance) {
                if (instance.exportFont){
                    var model = $scope.data.stateful.project.open(instance.name)
                      , glyphs = model.query('master#' + instance.name).children
                      , i, j
                      ;
                    for (i=0,j=glyphs.length; i<j; i++){
                        glyphs_for_cache.push([model, glyphs[i]]);
                    }
                }
            });
        });

        var current_glyph = 0
          , total_glyphs = glyphs_for_cache.length
          ;
          
        function setProgress(width, text) {
            $("#progressbar").css("opacity", 1);
            $("#progressbar").css("width", width + "%");
            $("#progresslabel").html(text);
        }
        
        function completeProgress() {
            $("#progressbar").css("opacity", 0);
        }
          
        function exportFont_compute_CPS_chunk(){
            if (current_glyph < total_glyphs){
                var value = glyphs_for_cache[current_glyph++]
                  , model = value[0]
                  , glyph = value[1]
                  ;
                model.getComputedStyle(glyph);
                var text = "Computing: " + current_glyph + "th glyph of " + total_glyphs + " glyphs...";
                setProgress((80 * current_glyph / total_glyphs), text);
                $timeout(exportFont_compute_CPS_chunk, 100);
            } else {
                setProgress(80, "Zipping your Instances");
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
                completeProgress();
            }
        }
        
        $timeout(exportFont_compute_CPS_chunk, 100);
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
