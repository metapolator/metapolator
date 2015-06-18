app.controller('fontexportController', ['$scope', '$http', 'sharedScope', '$timeout',
function($scope, $http, sharedScope, $timeout) {
    $scope.data = sharedScope.data;

    var ExportObject = (function() {
        function ExportObject(instance, fileFormat) {
            var retval;
            this.fileFormat = fileFormat || "UFO";
            this.instance = instance;

            if (this.fileFormat == "UFO"){
                getGenerator = $scope.data.stateful.project.getUFOExportGenerator;
//TODO:     } else if (this.fileFormat == "OTF"){
//TODO:         getGenerator = $scope.data.stateful.project.getOTFExportGenerator;
            }
            retval = getGenerator(
                instance.name
              , this.getFileName()
              , /* precision: */ -1
            );
            this.generator = retval[0];
            this.io = retval[1];
        }

        var _p = ExportObject.prototype;
        _p.constructor = ExportObject;

        _p.getFileName = function() {
            switch (this.fileFormat){
                case "UFO":
                    return this.instance.displayName + ".ufo";
                case "OTF":
                    return this.instance.displayName + ".otf";
            }
        };

        return ExportObject;
    })();

    var ProgressBar = (function() {
        function ProgressBar(barElementId, labelElementId, updateDelay) {
            this.bar = $(barElementId);
            this.label = $(labelElementId);
            this.updateDelay = updateDelay;
        }

        var _p = ProgressBar.prototype;
        _p.constructor = ProgressBar;

        _p.set = function(width, text) {
            this.bar.animate({"opacity": 1, "width": width + "%"}, this.updateDelay);
            if (text)
                this.label.html(text);
        };

        _p.reset = function() {
            this.bar.animate( {"opacity": 0, "width": 0}
                            , /*duration:*/ 0); // (that means "do it immediately!")
            this.label.html("");
        };

        _p.complete = function(){
            this.bar.animate( {"width": "100%", "opacity": 1}
                            , this.updateDelay);
            this.label.html("");
        };

        return ProgressBar;
    })();

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

    function getTimestamp(){
        var year, month, day, hours, minutes, seconds
          , date = new Date()
          ;
        function zeroPadding(value){
            return value < 10 ? "0" + String(value) : String(value);
        }
        year = zeroPadding(date.getFullYear());
        month = zeroPadding(date.getMonth() + 1); //getMonth() returns a zero-based value: 0=January, 11=December
        day = zeroPadding(date.getDate());
        hours = zeroPadding(date.getHours());
        minutes = zeroPadding(date.getMinutes());
        seconds = zeroPadding(date.getSeconds());

        return [year, month, day].join("") + "-" + [hours, minutes, seconds].join("");
    }

    var exportIsRunning = false;
    $scope.data.exportFonts = function() {

        //Do not trigger the export routine if no instance is selected for export,
        //otherwise it would result in an empty ZIP file.
        if (!$scope.data.instancesForExport())
            return;

        //Also avoid triggering a new export while we're still not finished
        if (exportIsRunning)
            return;

            /* An estimated 95% of the time is taken generating the files.
               The other 5% is spent zipping the results. */
        const GLYPHS_PHASE_PERCENTAGE = 95
            , UI_UPDATE_TIMESLICE = 50 // msecs
            ;

        var bundle = new $scope.data.stateless.JSZip()
          , bundleFolderName = "metapolator-export-" + getTimestamp()
          , bundleFileName = bundleFolderName + ".zip"
          , bundleFolder = bundle.folder(bundleFolderName)
          , bundleData
          , exportObjects = Array()
          , progress = new ProgressBar( "#progressbar"
                                      , "#progresslabel"
                                      , UI_UPDATE_TIMESLICE )
          ;
        exportIsRunning = true;
        progress.reset();

        angular.forEach($scope.data.families, function(family) {
            angular.forEach(family.instances, function(instance) {
                if (instance.exportFont){
                    exportObjects.push(new ExportObject(instance/*, fileFormat*/));
                }
            });
        });

        function setDownloadBlobLink(text, blob, filename) {
            var download = $("#blob_download");
            progress.complete();

            download.css("display", "block");
            download.children("a").html(text).click(function(){
                $scope.data.stateless.saveAs(blob, filename);
                progress.reset();
                download.css("display", "none").children("a").unbind("click");
                delete bundleData;
            });
        }

        function exportingGlyphMessage (it, instanceIndex){
            var msg
              , currentGlyph = it.value['current_glyph'] + 1 //humans start counting from 1.
              , totalGlyphs = it.value['total_glyphs']
              , glyphId = it.value['glyph_id']
              ;
            msg = totalInstances + " instances to export."
            msg += "Calculating glyph '" + glyphId + "' (" + currentGlyph + " of " + totalGlyphs + ")"
            msg += " of instance #" + (instanceIndex+1);
            return msg;
        }

        function zippingMessage (it, instanceIndex, totalInstances){
            var msg;
            msg = totalInstances + " instances to export in .ufo.zip format, ";
            msg += "zipping instance #" + (instanceIndex+1) + " (can take a while)";
            return msg;
        }

        function calculateGlyphsProgress(it, instanceIndex, totalInstances){
            var percentage
              , currentGlyph = it.value['current_glyph']
              , totalGlyphs = it.value['total_glyphs']
              ;
            percentage = GLYPHS_PHASE_PERCENTAGE * (instanceIndex + ((currentGlyph+1) / totalGlyphs))/totalInstances;
            return percentage;
        }

        var instanceIndex = 0
          , totalInstances = exportObjects.length
          , obj = exportObjects[0]
          ;
        function exportFontComputeGlyphs(){
            var text
              , percentage
              , it = obj.generator.next()
              ;
            if (!it.done && it.value['glyph_id'] != 'C'){ //DO NOT COMMIT THIS LINE CHANGE! It is a hack to reduce total export time during development
                text = exportingGlyphMessage(it, instanceIndex);
                percentage = calculateGlyphsProgress(it, instanceIndex, totalInstances);
                setProgress(percentage, text);
                $timeout(exportFontComputeGlyphs, UI_UPDATE_TIMESLICE);
            } else {
                delete generator;
                if (++instanceIndex < totalInstances) {
                    obj = exportObjects[instanceIndex];
                    $timeout(exportFontComputeGlyphs, UI_UPDATE_TIMESLICE);
                } else {
                    instanceIndex = 0;
                    text = zippingMessage(it, instanceIndex, totalInstances);
                    setProgress(GLYPHS_PHASE_PERCENTAGE, text);
                    $timeout(exportFontPackInstanceChunk, UI_UPDATE_TIMESLICE);
                }
            }
        }
        
        function exportFontPackInstanceChunk(){
            if (instanceIndex < totalInstances){
                obj = exportObjects[instanceIndex++]
                  , targetDirName = instance.displayName + ".ufo"
                  , filename = targetDirName + ".zip"
                  , text
                  , zippedData = $scope.data.stateful.project.getZipFromIo(false, instance.io, instance.getFileName(), "uint8array")
                  ;
                bundleFolder.file(filename, zippedData, {binary:true});
                //delete instance.io;
                delete zippedData;
                if (currentInstance == totalInstances)
                    text = "Packing all " + totalInstances + " instances into a final .zip (can take a while)";
                progress.set(GLYPHS_PHASE_PERCENTAGE + (100 - GLYPHS_PHASE_PERCENTAGE) * (currentInstance+1) / totalInstances);
                $timeout(exportFontPackInstanceChunk, UI_UPDATE_TIMESLICE);
            } else {
                bundleData = bundle.generate({type:"blob"});
                setDownloadBlobLink(bundleFileName, bundleData, bundleFileName);
                exportIsRunning = false;
            }
        }

        generator = getExportGenerator(currentInstance);
        $timeout(exportFontComputeGlyphs, UI_UPDATE_TIMESLICE);
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
        if (exportIsRunning)
            return false;
        else
            return ($scope.data.instancesForExport() > 0);
    };

}]);
