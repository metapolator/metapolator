define([
    'jquery'
  , 'jszip'
  , 'filesaver'
  , 'metapolator/ui/metapolator/ui-tools/instanceTools'
  , 'metapolator/ui/metapolator/ui-tools/dialog'
  , 'metapolator/project/MetapolatorProject'
], function(
    $
  , JSZip
  , saveAs
  , instanceTools
  , dialog
  , project
) {
    'use strict';
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
            clone = $scope.model.instanceSequences[0].createNewInstance(axes, designSpace, project);
            instanceTools.registerInstance(project, clone);
            $scope.model.instanceSequences[0].addInstance(clone);
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
            function ExportObject(instance, fileFormat) {
                var retval
                  , getGenerator
                  ;
                this.fileFormat = fileFormat || 'UFO';
                this.instance = instance;

                if (this.fileFormat == 'UFO'){
                    getGenerator = project.getUFOExportGenerator.bind(project);
                } else if (this.fileFormat == 'OTF'){
                    getGenerator = project.getOTFExportGenerator.bind(project);
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

            function exportingGlyphMessage (data, instanceIndex, totalInstances) {
                var msg
                  , instanceName = data.target_name
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

            _p.setData = function(index, totalInstances, data) {
                var text = exportingGlyphMessage(data, index, totalInstances)
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

        function generateFontBundle(exportObjects, UI_UPDATE_TIMESLICE, progress) {
            var bundle = new JSZip()
              , bundleFolderName = 'metapolator-export-' + getTimestamp()
              , bundleFileName = bundleFolderName + '.zip'
              , bundleFolder = bundle.folder(bundleFolderName)
              , totalInstances = exportObjects.length
              ;
            function _exportFontComputeGlyphs(exportObjects, totalInstances, bundleFolder, UI_UPDATE_TIMESLICE, progress, resolve, reject){
                if (exportObjects.length === 0){
                    resolve(true);
                    return;
                }

                var text
                  , percentage
                  , index = totalInstances - exportObjects.length
                  , obj = exportObjects[exportObjects.length - 1]
                  , it = obj.generator.next()
                  , data, name
                  ;
                if (!it.done){
                    if (progress){
                        it.target_data = obj.getFileName();
                        progress.setData(index, totalInstances, it.value);
                    }
                } else {
                    exportObjects.pop();

                    if (obj.fileFormat == 'UFO'){
                        data = project.getZipFromIo(false, obj.io, obj.getFileName(), 'uint8array');
                        name = obj.getFileName() + '.zip';
                    } else {
                        /* obj.fileFormat == 'OTF' */
                        data = obj.io.readFile(false, obj.getFileName());
                        name = obj.getFileName();
                    }
                    bundleFolder.file(name, data, {binary:true});
                }
                $timeout(_exportFontComputeGlyphs.bind(null, exportObjects, totalInstances, bundleFolder, UI_UPDATE_TIMESLICE, progress, resolve, reject)
                       , UI_UPDATE_TIMESLICE);
            }

            // note how the first three args are bound, new Promise will call the bound function with
            // the two missing args `resolve` and `reject`
            return new Promise(
                _exportFontComputeGlyphs.bind(null, exportObjects, totalInstances, bundleFolder, UI_UPDATE_TIMESLICE, progress)
            ).then(function(){
                return [bundleFileName, bundle.generate({type:'blob'})];
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
                        exportObjects.push(new ExportObject(instance, 'OTF'));
                        exportObjects.push(new ExportObject(instance, 'UFO'));
                    }
                }
            }

            $scope.exportIsRunning = true;
            const UI_UPDATE_TIMESLICE = 50; // msecs
            var progress = new InstanceExportProgressBar( $('#progressbar')
                                                        , $('#progresslabel')
                                                        , UI_UPDATE_TIMESLICE );
            function finalizeExport(result) {
                setDownloadBlobLink(result[0], result[1], result[0], progress);
                $scope.exportIsRunning = false;
            }
            generateFontBundle(exportObjects, UI_UPDATE_TIMESLICE, progress).then(finalizeExport);
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
    var _p = InstancePanelController.prototype;

    return InstancePanelController;
}); 
