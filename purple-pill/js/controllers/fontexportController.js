app.controller('fontexportController', ['$scope', '$http', 'sharedScope', '$timeout',
function($scope, $http, sharedScope, $timeout) {
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
          , instances_for_export = Array()
          ;
        angular.forEach($scope.data.families, function(family) {
            angular.forEach(family.instances, function(instance) {
                if (instance.exportFont){
                    instances_for_export.push(instance);
                }
            });
        });

        var current_instance = 0
          , total_instances = instances_for_export.length
          , glyphs_phase_percentage = 80 //An estimated 80% of the time is taken generating the files. The other 20% is spent zipping the results.
          , UI_UPDATE_TIMESLICE = 50 // msecs
          ;
          
        function setProgress(width, text) {
            $("#progressbar").animate({"opacity": 1, "width": width + "%"}, /*duration:*/ UI_UPDATE_TIMESLICE);
            if (text)
                $("#progresslabel").html(text);
        }

        function setDownloadBlobLink(text, blob, filename) {
            $("#progressbar").animate({"width": "100%", "opacity": 1}, /*duration:*/ UI_UPDATE_TIMESLICE);
            $("#progresslabel").html("");
            $("#blob_download").css("display", "block");
            $("#blob_download").children("a").html(text).click(function(){
                $scope.data.stateless.saveAs(blob, filename);
                resetProgressBar();
                delete bundle_data;
            });
        }
        
        function resetProgressBar() {
            $("#progressbar").animate({"opacity": 0, "width": 0}, /*duration:*/ 0); // (that means "do it immediately!")
            $("#progresslabel").html("");
            $("#blob_download").css("display", "none").children("a").unbind("click");
        }

        function exportFont_compute_glyphs(){
            var it = $scope.data.stateful.project.exportUFOInstance_chunk(instances_for_export[current_instance].name, /* precision: */ -1)
              , text
              , current_glyph
              , total_glyphs
              , glyph_name
              ;
            if (!it.done){
                current_glyph = it.value['current_glyph'];
                total_glyphs = it.value['total_glyphs'];
                glyph_id = it.value['glyph_id'];
                text = total_instances + " instances to export. Calculating glyph '" + glyph_id + "' (" + (current_glyph+1) + " of " + total_glyphs + ") of instance #" + (current_instance+1);
                setProgress(glyphs_phase_percentage * (current_instance + ((current_glyph+1) / total_glyphs))/total_instances, text);
                $timeout(exportFont_compute_glyphs, UI_UPDATE_TIMESLICE);
            } else {
                if (++current_instance < total_instances) {
                    $timeout(exportFont_compute_glyphs, UI_UPDATE_TIMESLICE);
                } else {
                    current_instance = 0;
                    text = total_instances + " instances to export in .ufo.zip format, zipping instance #" + (current_instance+1) + " (can take a while)";
                    setProgress(glyphs_phase_percentage, text);
                    $timeout(exportFont_pack_instance_chunk, UI_UPDATE_TIMESLICE);
                }
            }
        }
        
        function exportFont_pack_instance_chunk(){
            if (current_instance < total_instances){
                var instance = instances_for_export[current_instance++]
                  , targetDirName = instance.displayName + ".ufo"
                  , filename = targetDirName + ".zip"
                  , text
                  , precision = -1 //no rounding
                  , zipped_data = $scope.data.stateful.project.getZippedInstance(
                                   instance.name, targetDirName, precision, "uint8array")
                  ;
                bundleFolder.file(filename, zipped_data, {binary:true});
                if (current_instance == total_instances)
                    text = "Packing all " + total_instances + " instances into a final .zip (can take a while)";
                setProgress(glyphs_phase_percentage + (100 - glyphs_phase_percentage) * (current_instance+1) / total_instances);
                $timeout(exportFont_pack_instance_chunk, UI_UPDATE_TIMESLICE);
            } else {
                bundle_data = bundle.generate({type:"blob"});
                setDownloadBlobLink(bundle_filename, bundle_data, bundle_filename);
                export_is_running = false;
            }
        }

        $timeout(exportFont_compute_glyphs, UI_UPDATE_TIMESLICE);
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
