define([
    'metapolator/errors'
  , 'jquery'
  , 'jszip'
  , 'filesaver'
  , 'metapolator/ui/metapolator/ui-tools/instanceTools'
  , 'metapolator/ui/metapolator/ui-tools/dialog'
], function(
    errors
  , $
  , JSZip
  , saveAs
  , instanceTools
  , dialog
) {
    'use strict';

    var unhandledPromise = errors.unhandledPromise;

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
            instance = $scope.model.instanceSequences[0].createNewInstance(axes, designSpace, project);
            instanceTools.registerInstance(project, instance);
            $scope.model.instanceSequences[0].addInstance(instance);
        };

        $scope.cloneInstance = function () {
            var clone = $scope.model.currentInstance.clone($scope.model.currentDesignSpace, project);
            instanceTools.registerInstance(project, clone);
            $scope.model.currentInstance.parent.addInstance(clone);
        };

        $scope.removeInstance = function (instance) {
            var designSpace = instance.designSpace
              , n = 0;
            // check if it is the last instance on the design space
            for (var i = $scope.model.instanceSequences.length - 1; i >= 0; i--) {
                var sequence = $scope.model.instanceSequences[i];
                for (var j = sequence.children.length - 1; j >= 0; j--) {
                    var thisInstance = sequence.children[j];
                    if (thisInstance.designSpace === designSpace) {
                        n++;
                    }
                }
            }
            if (n === 1) {
                var message = 'Delete instance? This also deletes the design space ' + designSpace.name + '.';
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

        var ExportObject = (function() {
            function ExportObject(project, instance, fileFormat) {
                var genIo;
                this.fileFormat = fileFormat || 'UFO';
                this.instance = instance;

                if (this.fileFormat == 'UFO'){
                    genIo = project.getUFOExportGenerator(false, instance.name
                                            , this.getFileName(), 2, -1);
                } else if (this.fileFormat == 'OTF'){
                    genIo = project.getOTFExportGenerator(false, instance.name
                                            , this.getFileName(), -1);
                }
                this.generator = genIo[0];
                this.io = genIo[1];
                this.name = this.instance.displayName;
            }

            var _p = ExportObject.prototype;
            _p.constructor = ExportObject;

            _p.getFileName = function() {
                switch (this.fileFormat){
                    case 'UFO':
                        return this.instance.displayName + '.ufo';
                    case 'OTF':
                        return this.instance.displayName + '.otf';
                }
            };

            _p.pruneGenerator = function() {
                if (this.generator)
                    delete this.generator;
            };

            return ExportObject;
        })();

        var ProgressBar = (function() {
            function ProgressBar(barElement, labelElement, updateDelay) {
                this.bar = barElement;
                this.label = labelElement;
                this.updateDelay = updateDelay;
                this.reset();
            }

            var _p = ProgressBar.prototype;
            _p.constructor = ProgressBar;

            _p.set = function(width, text) {
                this.bar.animate({'opacity': 1, 'width': width + '%'}, this.updateDelay);
                if (text)
                    this.label.html(text);
            };

            _p.reset = function() {
                this.bar.animate( {'opacity': 0, 'width': 0}
                                , /*duration:*/ 0); // (that means 'do it immediately!')
                this.label.html('');
            };

            _p.complete = function(){
                this.bar.animate( {'width': '100%', 'opacity': 1}
                                , this.updateDelay);
                this.label.html('');
            };

            return ProgressBar;
        })();

        var InstanceExportProgressBar = (function(Parent) {
            function InstanceExportProgressBar(barElement, labelElement, updateDelay) {
                Parent.call(this, barElement, labelElement, updateDelay);
            }

            var _p = InstanceExportProgressBar.prototype = Object.create(Parent.prototype);
            _p.constructor = InstanceExportProgressBar;

            function exportingGlyphMessage (data, instanceIndex, instanceName, totalInstances) {
                var msg
                  , currentGlyph = data.current_glyph + 1 //humans start counting from 1.
                  , totalGlyphs = data.total_glyphs
                  , glyphId = data.glyph_id
                  ;
                msg = 'Calculating ' + glyphId + ' (' + currentGlyph + ' of ' + totalGlyphs + ')';
                msg += ' of ' + instanceName + ' (' + (instanceIndex + 1) + ' of ' + totalInstances + ')';
                return msg;
            }

            function calculateGlyphsProgress (data, instanceIndex, totalInstances) {
                var percentage
                  , currentGlyph = data.current_glyph
                  , totalGlyphs = data.total_glyphs
                  ;
                percentage = 100.0 * (instanceIndex + (currentGlyph/totalGlyphs)) / totalInstances;
                return percentage;
            }

            _p.setData = function(index, totalInstances, instanceName, data) {
                var text = exportingGlyphMessage(data, index, instanceName, totalInstances)
                  , width = calculateGlyphsProgress(data, index, totalInstances)
                  ;
                this.set(width, text);
            };

            return InstanceExportProgressBar;
        })(ProgressBar);

        $scope.instancesForExport = function () {
            for (var i = $scope.model.instanceSequences.length - 1; i >= 0; i--) {
                var sequence = $scope.model.instanceSequences[i];
                for (var j = sequence.children.length - 1; j >= 0; j--) {
                    var instance = sequence.children[j];
                    if (instance.exportFont) {
                        return true;
                    }
                }
            }
            return false;
        };

        function getTimestamp(){
            var year, month, day, hours, minutes, seconds
              , date = new Date()
              ;
            function zeroPadding(value){
                return value < 10 ? '0' + String(value) : String(value);
            }
            year = zeroPadding(date.getFullYear());
            month = zeroPadding(date.getMonth() + 1); //getMonth() returns a zero-based value: 0=January, 11=December
            day = zeroPadding(date.getDate());
            hours = zeroPadding(date.getHours());
            minutes = zeroPadding(date.getMinutes());
            seconds = zeroPadding(date.getSeconds());

            return [year, month, day].join('') + '-' + [hours, minutes, seconds].join('');
        }

        function setDownloadBlobLink(text, blob, filename, progress) {
            var download = $('#blob_download');
            if (progress)
                progress.complete();

            download.css('display', 'block');
            download.children('a').html(text).click(function(){
                saveAs(blob, filename);
                if (progress)
                    progress.reset();
                download.css('display', 'none').children('a').unbind('click');
            });
        }

        $scope.exportIsRunning = false;

        function _setFileToZipFolder(name, data) {
            //jshint validthis:true
            this.file(name, data, {binary:true});
        }


        function _job (exportObjects, totalInstances, bundleFolder, progress) {
            var index = totalInstances - exportObjects.length
              , obj = exportObjects[exportObjects.length - 1]
              , it = obj.generator.next()
              , promise
              , name
              ;

            if (!it.done) {
                if (progress)
                    progress.setData(index, totalInstances, obj.name, it.value);
                return null;
            }

            // done
            exportObjects.pop();
            if (obj.fileFormat == 'UFO') {
                // === zipUtil.pack
                promise = project.getZipFromIo(true, obj.io, obj.getFileName(), 'uint8array');
                name = obj.getFileName() + '.zip';
            }
            else {
                /* obj.fileFormat == 'OTF' */
                promise = obj.io.readFile(true, obj.getFileName());
                name = obj.getFileName();
            }
            return promise.then(_setFileToZipFolder.bind(bundleFolder, name));
        }

        function _runner(done, job, timeout, nextRun) {
            // done
            if (done())
                return true;
            // do
            var promise = job();
            if(promise !== null)
                return promise.then(nextRun);
            // The return value of calling $timeout is a promise ...
            // The promise will be resolved with the return value of the fn function.
            // If the return value of fn is a promise $timeout does the right thing
            // and resolves when the inner promise is resolved.
            // recursive!
            return $timeout(nextRun, timeout);
        }

        function _exportFontComputeGlyphs(exportObjects, totalInstances,
                                bundleFolder, timeout, progress) {

            var done = function () { return exportObjects.length === 0; }
              , job = _job.bind(null, exportObjects, totalInstances, bundleFolder, progress)
                // recursive call
              , nextRun = function(){ return _runner(done, job, timeout, nextRun);}
              ;
            return nextRun();
        }

        function generateFontBundle(exportObjects, UI_UPDATE_TIMESLICE, progress) {
            var bundle = new JSZip()
              , bundleFolderName = 'metapolator-export-' + getTimestamp()
              , bundleFileName = bundleFolderName + '.zip'
              , bundleFolder = bundle.folder(bundleFolderName)
              , totalInstances = exportObjects.length
              , generateZip = bundle.generateAsync.bind(bundle, {type:'blob'}, undefined)
              , promise = _exportFontComputeGlyphs(
                              exportObjects
                            , totalInstances
                            , bundleFolder
                            , UI_UPDATE_TIMESLICE
                            , progress)

            ;

            if(promise === true)
                // nothing to do, exportObjects.length was 0
                promise = generateZip();
            else
                promise = promise.then(generateZip);

            return promise.then(function(zip) {
                return [bundleFileName, zip];
            });
        }

        $scope.exportFonts = function() {
            //Do not trigger the export routine if no instance is selected for export,
            //otherwise it would result in an empty ZIP file.
            if (!$scope.instancesForExport())
                return;

            //Also avoid triggering a new export while we're still not finished
            if ($scope.exportIsRunning)
                return;

            var exportObjects = [];
            for (var i = 0; i < $scope.model.instanceSequences.length; i++) {
                var sequence = $scope.model.instanceSequences[i];
                for (var j = 0; j < sequence.children.length; j++) {
                    var instance = sequence.children[j];
                    if (instance.exportFont){
                        instance.measureAllGlyphs();
                        exportObjects.push(new ExportObject(project, instance, 'OTF'));
                        exportObjects.push(new ExportObject(project, instance, 'UFO'));
                    }
                }
            }

            $scope.exportIsRunning = true;
            var UI_UPDATE_TIMESLICE = 50; // msecs
            var progress = new InstanceExportProgressBar( $('#progressbar')
                                                        , $('#progresslabel')
                                                        , UI_UPDATE_TIMESLICE );
            function finalizeExport(result) {
                setDownloadBlobLink(result[0], result[1], result[0], progress);
                $scope.exportIsRunning = false;
            }
            generateFontBundle(exportObjects, UI_UPDATE_TIMESLICE, progress)
                    .then(finalizeExport, unhandledPromise);
        };

        // angular-ui sortable
        $scope.sortableOptions = {
            handle : '.list-edit',
            helper : 'clone'
        };

        // hover functions
        $scope.mouseoverInstance = function(instance) {
            // Dim slider diamonds
            var svgCurrent = $('.design-space-diamond.instance-' + instance.name);
            $('.design-space-diamond').not(svgCurrent).each(function() {
                $(this).css({ opacity: 0.1 });
            });
            // Dim specimen text
            if (instance.display || instance === $scope.model.currentInstance) {
                // here is 'master' used for syncing with master reasons
                var textCurrent = $('.specimen-field-instance ul li.master-' + instance.name);
                $('.specimen-field-instance ul li').not(textCurrent).each(function() {
                    $(this).addClass('dimmed');
                });
            }
        };

        $scope.mouseleaveInstance = function() {
            // Restore slider diamonds
            $('.design-space-diamond').css('opacity', '');
            // Restore specimen text
            $('.specimen-field-instance ul li').removeClass('dimmed');
        };
    }

    InstancePanelController.$inject = ['$scope', '$timeout', 'project'];
    // var _p = InstancePanelController.prototype;

    return InstancePanelController;
});
