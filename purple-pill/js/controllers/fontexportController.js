app.controller('fontexportController', ['$scope', '$http', 'sharedScope', '$timeout',
function($scope, $http, sharedScope, $timeout) {
    $scope.data = sharedScope.data;

    var ExportObject = (function() {
        function ExportObject(instance, fileFormat) {
            var retval;
            this.fileFormat = fileFormat || "UFO";
            this.instance = instance;

            if (this.fileFormat == "UFO"){
                getGenerator = $scope.data.stateful.project.getUFOExportGenerator.bind($scope.data.stateful.project);
//TODO:     } else if (this.fileFormat == "OTF"){
//TODO:         getGenerator = $scope.data.stateful.project.getOTFExportGenerator.bind($scope.data.stateful.project);
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

        _p.pruneGenerator = function() {
            if (this.generator)
                delete this.generator;
        }

        return ExportObject;
    })();

    var ProgressBar = (function() {
        function ProgressBar(barElement, labelElement, updateDelay) {
            this.bar = barElement;
            this.label = labelElement;
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

        const UI_UPDATE_TIMESLICE = 50; // msecs

        var bundle = new $scope.data.stateless.JSZip()
          , bundleFolderName = "metapolator-export-" + getTimestamp()
          , bundleFileName = bundleFolderName + ".zip"
          , bundleFolder = bundle.folder(bundleFolderName)
          , bundleData
          , exportObjects = Array()
          , totalInstances
          , progress = new ProgressBar( $("#progressbar")
                                      , $("#progresslabel")
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

        totalInstances = exportObjects.length;

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

        function exportingGlyphMessage (it, instanceIndex, totalInstances){
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

        function calculateGlyphsProgress(it, instanceIndex, totalInstances){
            var percentage
              , currentGlyph = it.value['current_glyph']
              , totalGlyphs = it.value['total_glyphs']
              ;
            percentage = 100.0 * (instanceIndex + (currentGlyph/totalGlyphs)) / totalInstances;
            return percentage;
        }

        function exportFontComputeGlyphs(exportObjects, totalInstances){
            if (exportObjects.length==0)
                return;

            var text
              , percentage
              , zippedData
              , index = totalInstances - exportObjects.length
              , obj = exportObjects[exportObjects.length - 1]
              , it = obj.generator.next()
              ;
            if (!it.done){
                text = exportingGlyphMessage(it, index, totalInstances);
                percentage = calculateGlyphsProgress(it, index, totalInstances);
                progress.set(percentage, text);
                $timeout(exportFontComputeGlyphs.bind(null, exportObjects, totalInstances), UI_UPDATE_TIMESLICE);
            } else {
                obj.pruneGenerator();

                if (obj.fileFormat == "UFO"){
                    zippedData = $scope.data.stateful.project.getZipFromIo(false, obj.io, obj.getFileName(), "uint8array");
                    bundleFolder.file(obj.getFileName()+".zip", zippedData, {binary:true});
                    delete zippedData;
                } else { /* obj.fileFormat == "OTF" */
                    var plainData = obj.io.readFile(false, obj.getFileName());
                    bundleFolder.file(obj.getFileName(), plainData, {binary:true});
                }

                exportObjects.pop();
                if (exportObjects.length) {
                    $timeout(exportFontComputeGlyphs.bind(null, exportObjects, totalInstances), UI_UPDATE_TIMESLICE);
                } else {
                    bundleData = bundle.generate({type:"blob"});
                    setDownloadBlobLink(bundleFileName, bundleData, bundleFileName);
                    exportIsRunning = false;
                }
            }
        }
        
        $timeout(exportFontComputeGlyphs.bind(null, exportObjects, totalInstances), UI_UPDATE_TIMESLICE);
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
