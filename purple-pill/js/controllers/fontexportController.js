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

    var export_is_running = false;
    $scope.data.exportFonts = function() {

        //Do not trigger the export routine if no instance is selected for export,
        //otherwise it would result in an empty ZIP file.
        if (!$scope.data.instancesForExport())
            return;

        //Also avoid triggering a new export while we're still not finished
        if (export_is_running)
            return;

        export_is_running = true;
        resetProgressBar();

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
          , bundle_data
          ;

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

        var glyphs_for_cache = Array()
          , instances_for_export = Array()
          ;
        angular.forEach($scope.data.families, function(family) {
            angular.forEach(family.instances, function(instance) {
                if (instance.exportFont){
                    instances_for_export.push(instance);
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
          , current_instance = 0
          , total_instances = instances_for_export.length
          , UI_UPDATE_TIMESLICE = 100 //msecs
          , CPS_phase_percentage = 80 //The other 20% of the time is estimated to be spent packing
                                      //the instances and the final zip file.
          ;
          
        function setProgress(width, text) {
            $("#progressbar").css("opacity", 1);
            $("#progressbar").css("width", width + "%");
            if (text)
                $("#progresslabel").html(text);
        }

        function setDownloadBlobLink(text, blob, filename) {
            $("#progressbar").css("width", "100%");
            $("#progressbar").css("opacity", 1);
            $("#progresslabel").html("");
            $("#blob_download").css("display", "block");
            $("#blob_download").children("a").html(text).click(function(){
                $scope.data.stateless.saveAs(blob, filename);
                resetProgressBar();
                $(this).unbind("click");
                delete bundle_data;
            });
        }
        
        function resetProgressBar() {
            $("#progressbar").css("opacity", 0);
            $("#progressbar").css("width", 0);
            $("#progresslabel").html("");
            $("#blob_download").css("display", "none");
        }
          
        function exportFont_compute_CPS_chunk(){
            if (current_glyph < total_glyphs){
                var value = glyphs_for_cache[current_glyph++]
                  , model = value[0]
                  , glyph = value[1]
                  , text
                  ;
                model.getComputedStyle(glyph);
                text = "Computing: " + current_glyph + "th glyph of " + total_glyphs + " glyphs...";
                setProgress(CPS_phase_percentage * (current_glyph+1) / total_glyphs, text);
                $timeout(exportFont_compute_CPS_chunk, UI_UPDATE_TIMESLICE);
            } else {
                text = "Packing UFO ZIP instances... <em>(this may take a while)</em>";
                setProgress(CPS_phase_percentage, text);
                $timeout(exportFont_pack_instance_chunk, UI_UPDATE_TIMESLICE);
            }
        }
        
        function exportFont_pack_instance_chunk(){
            if (current_instance < total_instances){
                var instance = instances_for_export[current_instance++]
                  , targetDirName = instance.displayName + ".ufo"
                  , filename = targetDirName + ".zip"
                  ;
                var precision = -1 //no rounding
                  , zipped_data = $scope.data.stateful.project.getZippedInstance(
                                   instance.name, targetDirName, precision, "uint8array")
                  ;
                bundleFolder.file(filename, zipped_data, {binary:true});
                var text;
                if (current_instance == total_instances)
                    text = "Generating the final ZIP container...";
                setProgress(CPS_phase_percentage + (100 - CPS_phase_percentage) * (current_instance+1) / total_instances);
                $timeout(exportFont_pack_instance_chunk, UI_UPDATE_TIMESLICE);
            } else {
                bundle_data = bundle.generate({type:"blob"});
                setDownloadBlobLink(bundle_filename, bundle_data, bundle_filename);
                export_is_running = false;
            }
        }

        $timeout(exportFont_compute_CPS_chunk, UI_UPDATE_TIMESLICE);
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

    $scope.data.exportButtonIsActive = function() {
        if (export_is_running)
            return false;
        else
            return ($scope.data.instancesForExport() > 0);
    };

}]);
