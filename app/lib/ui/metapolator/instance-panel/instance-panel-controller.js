define([
    'jquery'
  , 'metapolator/ui/metapolator/services/instanceTools'
  , 'metapolator/ui/metapolator/services/dialog'
], function(
    $
  , instanceTools
  , dialog
) {
    "use strict";
    function InstancePanelController($scope, $timeout, project) {
        this.$scope = $scope;
        this.$scope.name = 'masterPanel';

        $scope.addInstance = function () {
            var designSpace = $scope.model.currentInstance.designSpace
              , axes = []
              , instance
              , n = designSpace.axes.length;
            for (var i = 0; i < n; i++) {
                var master = designSpace.axes[i];
                axes.push({
                    master: master,
                    axisValue: 50,
                    metapolationValue: 1 / n
                });
            }
            instance = $scope.model.instances[0].createNewInstance(axes, designSpace, project);
            instanceTools.registerInstance(project, instance);
            $scope.model.instances[0].addInstance(instance);
        };
        
        $scope.cloneInstance = function () {
            var designSpace = $scope.model.currentDesignSpace
              , axes = []
              , clone;
            for (var i = 0, l = $scope.model.currentInstance.axes.length; i < l; i++) {
                var axis = $scope.model.currentInstance.axes[i];
                axes.push({
                    axisValue: axis.axisValue,
                    metapolationValue : axis.metapolationValue,
                    // keep the reference of the master
                    master: axis.master
                });
            }
            clone = $scope.model.instances[0].createNewInstance(axes, designSpace, project);
            instanceTools.registerInstance(project, clone);
            $scope.model.instances[0].addInstance(clone);
        };
        
        $scope.removeInstance = function (instance) {
            var designSpace = instance.designSpace
              , index = $scope.model.instances[0].children.indexOf(instance)
              , l
              , n = 0;
            // check if it is the last instance on the design space
            for (var i = $scope.model.instances.length - 1; i >= 0; i--) {
                var sequence = $scope.model.instances[i];
                for (var j = sequence.children.length - 1; j >= 0; j--) {
                    var thisInstance = sequence.children[j];
                    if (thisInstance.designSpace === designSpace) {
                        n++;
                    }
                }
            } 
            if (n == 1) {
                var message = "Delete instance? This also deletes the design space '" + designSpace.name + "'.";
                dialog.confirm(message, function(result){
                    if (result) {
                        instance.remove();
                        designSpace.remove();
                        $scope.$apply();
                    }
                });
            } else {
                instance.remove();
            }

        };
        
        $scope.canAddInstance = function () {
            var designSpace = $scope.model.currentDesignSpace;
            if (designSpace && designSpace.axes.length > 0) {
                return true;
            } else {
                return false;
            }
        };
        
        //export fonts
        
        $scope.instancesForExport = function () {
            for (var i = $scope.model.instances.length - 1; i >= 0; i--) {
                var sequence = $scope.model.instances[i];
                for (var j = sequence.children.length - 1; j >= 0; j--) {
                    var instance = sequence.children[j];
                    if (instance.exportFont) {
                        return true;
                    }
                }
            } 
            return false;
        };

        /*

        $scope.export_is_running = false;
        
        $scope.exportFonts = function() {
            //Do not trigger the export routine if no instance is selected for export,
            //otherwise it would result in an empty ZIP file.
            if (!$scope.instancesForExport())
                return;
    
            //Also avoid triggering a new export while we're still not finished
            if ($scope.export_is_running)
                return;

            $scope.export_is_running = true;
            resetProgressBar();
            
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
              , UI_UPDATE_TIMESLICE = 50 // msecs
              , CPS_phase_percentage = 50 //The other 50% of the time is estimated to be spent packing
                                          //the instances and the final zip file.
              ;
              
            function setProgress(width, text) {
                $("#progress-bar").animate({"opacity": 1, "width": width + "%"}, UI_UPDATE_TIMESLICE);
                if (text)
                    $("#progress-bar-label").html(text);
            }
    
            function setDownloadBlobLink(text, blob, filename) {
                $("#progress-bar").animate({"width": "100%", "opacity": 1},  UI_UPDATE_TIMESLICE);
                $("#progress-bar-label").html("");
                $("#progress-bar-blob-download").css("display", "block");
                $("#progress-bar-blob-download").children("a").html(text).click(function(){
                    $scope.data.stateless.saveAs(blob, filename);
                    resetProgressBar();
                    //delete bundle_data;
                });
            }
            
            function resetProgressBar() {
                $("#progress-bar").animate({"opacity": 0, "width": 0}, 0); // (that means "do it immediately!")
                $("#progress-bar-label").html("");
                $("#progress-bar-blob-download").css("display", "none").children("a").unbind("click");
            }
              
            function exportFont_compute_CPS_chunk(){
                if (current_glyph < total_glyphs){
                    var value = glyphs_for_cache[current_glyph++]
                      , model = value[0]
                      , glyph = value[1]
                      , text
                      ;
                    // TODO model.getComputedStyle(glyph) basically does nothing, so @graphicore will make this actually do something
                    model.getComputedStyle(glyph);
                    text = total_glyphs + " glyphs in " + total_instances + " instances to export, calculating glyph #" + current_glyph;
                    setProgress(CPS_phase_percentage * (current_glyph+1) / total_glyphs, text);
                    $timeout(exportFont_compute_CPS_chunk, UI_UPDATE_TIMESLICE);
                } else {
                    text = total_instances + " instances to export in .ufo.zip format, zipping instance #" + (current_instance+1) + " (can take a while)";
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
                        text = "Packing all " + total_instances + " instances into a final .zip (can take a while)";
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
        */

        // angular-ui sortable
        $scope.sortableOptions = {
            handle : '.list-edit',
            helper : 'clone'
        };
        
        // hover functions
        $scope.mouseoverInstance = function(instance) {
            // Dim slider diamonds
            var svgCurrent = $(".design-space-diamond.instance-" + instance.name);
            $(".design-space-diamond").not(svgCurrent).each(function() {
                $(this).css({ opacity: 0.1 });
            });
            // Dim specimen text
            if (instance.display || instance === $scope.model.currentInstance) {
                // here is 'master' used for syncing with master reasons
                var textCurrent = $(".specimen-field-instances ul li.master-" + instance.name);
                $(".specimen-field-instances ul li").not(textCurrent).each(function() {
                    $(this).addClass("dimmed");
                });
            }
        };
    
        $scope.mouseleaveInstance = function() {
            // Restore slider diamonds
            $(".design-space-diamond").css("opacity", "");
            // Restore specimen text
            $(".specimen-field-instances ul li").removeClass("dimmed");
        };
    }

    InstancePanelController.$inject = ['$scope', '$timeout', 'project'];
    var _p = InstancePanelController.prototype;

    return InstancePanelController;
}); 