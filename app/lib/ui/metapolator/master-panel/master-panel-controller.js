define([
    'jquery'
  , 'angular'
  , 'metapolator/ui/metapolator/ui-tools/instanceTools'
  , 'metapolator/ui/metapolator/ui-tools/dialog'
  , 'metapolator/ui/metapolator/ui-tools/selectionTools'
  , 'require/text!metapolator-cpsLib/ui-master.cps'
  , './import/ImportProcess'
  , 'Atem-Logging/Level'
  , 'Atem-Logging/CallbackHandler'
  , 'Atem-Logging/Formatter'
  , 'Atem-Logging/LogRecord'
  , 'marked'
], function(
    $
  , angular
  , instanceTools
  , dialog
  , selection
  , cpsUIMasterTemplate
  , ImportProcess
  , Level
  , CallbackHandler
  , Formatter
  , LogRecord
  , marked
) {
    "use strict";
    /*global window:true, document:true, FileReader:true*/
    function MasterPanelController($scope, $element, project) {
        this.$scope = $scope;

        $scope.removeMasters = function() {
            if ($scope.model.areMastersSelected()) {
                for (var i = 0, l = $scope.model.masterSequences.length; i < l; i++) {
                    var sequence = $scope.model.masterSequences[i];
                    for (var j = 0, jl = sequence.children.length; j < jl; j++) {
                        var master = sequence.children[j];
                        if (master.edit) {
                            master.remove();
                        }
                    }
                }

            }
        };

        $scope.duplicateMasters = function() {
            if ($scope.model.areMastersSelected()) {
                for (var i = 0, l = $scope.model.masterSequences.length; i < l; i++) {
                    var sequence = $scope.model.masterSequences[i]
                      , clones = []
                      , clonedMOM
                      ;
                    for (var j = 0, jl = sequence.children.length; j < jl; j++) {
                        var master = sequence.children[j];
                        master.deselectAllChildren();
                        // todo: change [0] to [viewState]

                        if (!master.edit)
                            continue;

                        var clone = master.clone() // this not MOM, it is the metapolator model
                          , newId = sequence.addToMasterId()
                          ;

                        // FIXME: clonedMOM.id might be !== clone.name
                        clonedMOM = project.cloneMaster(false, master.name,
                                // giving it a unique name before registering
                                // NOTE: this is not DRY but it follows the convention
                                // of prefixing ui masters with "master-"
                                "master-" + master.sequenceId + "-" + newId);
                        setCloneProperties(clone, newId, clonedMOM);

                        master.edit = false;
                        // a clone could have stacked parameters, if there are any
                        // they are not registered as such, becuase the parameters
                        // arent created in a regular way. So to be safe we
                        // destack the clones parameters standard.
                        for (var k = 0, kl = clone.parameters.length; k < kl; k++) {
                            clone.parameters[k].destackOperators();
                        }
                        clones.push(clone);
                    }
                    for (var m = 0, ml = clones.length; m < ml; m++) {
                        sequence.add(clones[m]);
                    }
                }
                selection.updateSelection('master');
            }
        };

        function setCloneProperties(clone, id, momMaster) {
            clone.name = momMaster.id;
            clone.id = id;
            clone.setMasterAndMOM(clone, momMaster);
            clone.displayName = nameCopy(clone.displayName);


            // probably unused as of now -> it is used a lot, for the parameters!
            // however, the source of it is in project
            clone.cpsFile = project.controller.getCPSName(momMaster);
        }

        function nameCopy (name) {
            // todo: put some more intelligence in here
            return name + " copy";
        }

        // apparently these two prefixed deserve a better place, because
        // they are so important.
        // They are considered the Metapolator convention for master naming.
        // Also 'instance-' for instance masters is missing in this list.
        // This is currently located in instanceModel.
        var baseMasterPrefix = 'base-'
          , uiMasterPrefix = 'master-'
          ;
        // As the onMasterReady callback of ImportProcess
        function initUiMaster(baseMaster) {
            var uiMasterName = uiMasterPrefix + (baseMaster.id.slice(baseMasterPrefix.length))
              , momMaster = project.createDerivedMaster(false, baseMaster.id, uiMasterName, cpsUIMasterTemplate)
              // deprecated: we don't use this anymore
              , cpsFile = null
              ;
            project.addMasterToSession(momMaster);
            // TODO: This could be done by listening to univers
            // (if univers would emit this kind of events … it does now!)
            $scope.model.masterSequences[0].addMaster(momMaster.id, momMaster, cpsFile);
        }

        $scope.importProcesses = [];
        var importProcessData = new Map();

        function finishImportProcess(process) {
            var i = $scope.importProcesses.indexOf(process);
            if(i===-1)
                // Would be an error if this happened!
                return;
            // remove!
            $scope.importProcesses.splice(i, 1);
            // display status/error reporting somewhere


            var win = window.open(), importReport;
            if(win) {

                // how to pop-under?
                win.blur();
                window.focus();

                importReport = importProcessData.get(process);
                importProcessData.delete(process);
                importReport.makeReport(win.document);

            }
            $scope.$apply();
        }

        var ObjectFormatter = (function(){
            function ObjectFormatter() {
                // Cargo-cult pattern from util-logging
                (this.super_ = Formatter.super_).call(this);
            }

            var _p = ObjectFormatter.prototype = Object.create(Formatter.prototype);

            /**
             * returns null or:
             * {
             *      message: type string
             *    , level: type string
             *    , parameters: type array (may be empty)
             * }
             *
             * Copied rom YAMLFormatter and then trimmed.
             */
            _p.formatMessage = function(logRecord) {
                var record = {}, type, thrown;
                if (!logRecord || !(logRecord instanceof LogRecord))
                    return null;


                thrown = logRecord.getThrown();
                if(thrown)
                    record.message = thrown.name + ' ' + thrown.message;
                else
                    record.message = logRecord.getMessage() || "(no message)";

                var level = logRecord.getLevel();
                if (level)
                    record.level = level.getName();

                var parameters = logRecord.getParameters();
                if (parameters && parameters instanceof Array)
                    record.parameters = parameters;
                else
                    record.parameters = [];

                type = record.level === 'INFO'
                                ? '' : '**'+record.level+'**' + '\n';

                if(record.message[0] === '#')
                    return record.message + (type && ' ') + type
                        + (record.parameters.length && ' ' + record.parameters.join() || '');

                return ' * ' + type + (type && ' ') + record.message
                        + (record.parameters.length && ' ' + record.parameters.join() || '');
            };

            return ObjectFormatter;
        })();

        var ImportReport = (function (ObjectFormatter) {
            function ImportReport() {
                this._logData = [];
                this.logHandler = new CallbackHandler(this._log.bind(this));

                this.logHandler.setLevel(Level.INFO);
                // this is how to set a formatter that is not the default one.
                this.logHandler.setFormatter(new ObjectFormatter());
            }
            var _p = ImportReport.prototype;

            _p._log = function(message) {
                this._logData.push(message);
            };

            _p._makeReportHeader = function(document) {
                var header = document.createElement('header');
                header.innerHTML = marked('# Metapolator UFO Import Report\n\n'
                        + 'Date: ' + new Date() + '\n\n'
                        // + 'Log entries: ' + this._logData.length
                );
                return header;
            };

            _p._makeReportBody = function() {
                var article = document.createElement('article')
                  , lines = [], i, l
                  ;

                function removeEmptyGlyphs(lines) {
                    var glyphStart = '### glyph';
                    while(lines.length && lines[lines.length-1].slice(0, glyphStart.length) === glyphStart)
                        // if there are other glyph start line before, without
                        // further log entries, remove them, because they
                        // just "bloat" the report
                        lines.pop();
                }

                for(i=0,l=this._logData.length;i<l;i++) {
                    if(this._logData[i][0] === '#')
                        // this is a "headline" of some kind, so some new "blog"
                        // cleaning up empty glyphs
                        removeEmptyGlyphs(lines);
                    lines.push(this._logData[i]);
                }
                removeEmptyGlyphs(lines);
                article.innerHTML = marked(lines.join('\n'));
                return article;
            };

            _p.makeReport = function (document) {
                var header = this._makeReportHeader(document)
                  , body = this._makeReportBody(document)
                  ;
                document.title = 'UFO import report | Metapolator';
                document.body.appendChild(header);
                document.body.appendChild(body);
            };
            return ImportReport;
        })(ObjectFormatter);

        $scope.handleUFOimportFiles = function(element) {
            var ufozipfile = element.files[0]
              , reader
              , importReport
              ;
            if(!ufozipfile)
                return;
            reader = new FileReader();
            reader.onload = function(e) {

                importReport = new ImportReport();
                var process = new ImportProcess(project, e.target.result
                    , baseMasterPrefix, initUiMaster, importReport.logHandler);
                importProcessData.set(process, importReport);

                $scope.importProcesses.push(process);
                /*global alert:true*/
                // some callback to remove it when it's done ...
                process.after(finishImportProcess)
                        // I doubt though that there will be an ultimate rejection
                        // for process, so the error handler will never be called.
                        // via process, but finishImportProcess could still fail ...
                       .then(null, function(e){alert(e); throw e;});
                $scope.$apply();
            };
            reader.readAsArrayBuffer(ufozipfile);
        };

        $scope.importUfo = function() {
            var doc = $element[0].ownerDocument
             , input = doc.createElement('input')
             ;
            input.setAttribute('type', 'file');
            input.setAttribute('accept', 'application/zip');
            input.addEventListener('change'
                , $scope.handleUFOimportFiles.bind($scope, input), false);
            // Seems like we don't even have to append this to the DOM!
            // Which is good, so we don't have to remove it either.
            // This is a really nice feature.
            input.click();
        };

        $scope.addMasterToDesignSpace = function (master) {
            var designSpace = $scope.model.currentDesignSpace
              , axes = designSpace.axes
              , axisValue = null
              , instanceAxes;
            if (axes.length === 0) {
                axisValue = 50;
                designSpace.addAxis(master);
                instanceAxes = [{
                    master: master
                  , axisValue: axisValue
                  , metapolationValue : 1
                }];
                // ->> exactly the same 3 lines as in instance-panel-controller
                var newInstance = $scope.model.instanceSequences[0].createNewInstance(instanceAxes, designSpace, project);
                instanceTools.registerInstance(project, newInstance);
                $scope.model.instanceSequences[0].addInstance(newInstance);


            }  else {
                var result = designSpace.axes[0].momElement
                    .isInterpolationCompatible(master.momElement, true);
                if(!result[0]) {
                    console.log('Not compatible:', result[1]);
                    return;
                }

                designSpace.addAxis(master);
                // add this axes to each instance in the design space
                for (var i = $scope.model.instanceSequences.length - 1; i >= 0; i--) {
                    var sequence = $scope.model.instanceSequences[i];
                    for (var j = sequence.children.length - 1; j >= 0; j--) {
                        var instance = sequence.children[j];
                        if (instance.designSpace === designSpace) {
                            if (instance.axes.length === 1) {
                                axisValue = 100 - instance.axes[0].axisValue;
                            } else {
                                axisValue = 0;
                            }
                            instance.addAxis(master, axisValue, null, project);
                            instanceTools.update(project, instance);
                        }
                    }
                }
            }
            //$scope.data.checkIfIsLargest();
        };

        // angular-ui sortable
        $scope.sortableOptions = {
            handle : '.list-edit',
            helper : 'clone',
            connectWith : '.drop-area',
            sort : function(e, ui) {
                if (isOverDropArea(ui)) {
                    $(".drop-area").addClass("drag-over");
                    if (!cursorHelper) {
                        createCursorHelper(e.pageX, e.pageY);
                    }
                    setPositionCursorHelper(e.pageX, e.pageY);
                    var element = $(ui.item).find("mtk-master");
                    var master = angular.element(element).isolateScope().model;
                    if (isInDesignSpace(master)) {
                        setColorCursorHelper(false) ;
                    } else {
                        setColorCursorHelper(true);
                        $(".drop-area").addClass("drag-over");
                    }

                } else {
                    destroyCursorHelper();
                    $(".drop-area").removeClass("drag-over");
                }
            },
            update : function(e, ui) {

            },
            stop : function(e, ui) {
                destroyCursorHelper();
                var element = $(ui.item).find("mtk-master");
                var master = angular.element(element).isolateScope().model;

                if (isOverDropArea(ui) && !isInDesignSpace(master)) {
                    // push master to design space when dropped on drop-area
                    $scope.addMasterToDesignSpace(master);
                    $scope.$apply();
                }
                $(".drop-area").removeClass("drag-over");
            }
        };

        function isOverDropArea(master) {
            if ($scope.model.currentDesignSpace) {
                var dropLeft = $(".drop-area").offset().left;
                var dropRight = $(".drop-area").offset().left + $(".drop-area").outerWidth();
                var dropTop = $(".drop-area").offset().top;
                var dropBottom = $(".drop-area").offset().top + $(".drop-area").outerHeight();
                var thisLeft = master.offset.left;
                var thisRight = master.offset.left + master.item.outerWidth();
                var thisTop = master.offset.top;
                var thisBottom = master.offset.top + master.item.outerHeight();
                var marginHor = master.item.outerWidth() / 2;
                var marginVer = master.item.outerHeight() / 2;
                if (dropLeft < (thisLeft + marginHor) && dropRight > (thisRight - marginHor) && dropTop < (thisTop + marginVer) && dropBottom > (thisBottom - marginVer)) {
                    return true;
                } else {
                    return false;
                }
            } else {
                return false;
            }
        }

        function isInDesignSpace(master) {
            var designSpace = $scope.model.currentDesignSpace;
            for (var i = designSpace.axes.length - 1; i >= 0; i--) {
                var masterInDS = designSpace.axes[i];
                if (masterInDS === master) {
                    return true;
                }
            }
            return false;
        }

        //cursorhelper functions
        var cursorHelper = false
          , templayer = $('<div class="cursor-helper"></div>')[0];

        function createCursorHelper(x, y) {
            cursorHelper = true;
            $(document.body).append(templayer);
            $(templayer).css({
                'left' : x + 10,
                'top' : y + 10
            });
        }

        function destroyCursorHelper() {
            $(templayer).remove();
            cursorHelper = false;
        }

        function setPositionCursorHelper(x, y) {
            $(templayer).css({
                "left" : x + 10,
                "top" : y + 10
            });
        }

        function setColorCursorHelper(ok) {
            if (ok) {
                $(templayer).html("+").removeClass("cursor-not-ok");
            } else {
                $(templayer).html("×").addClass("cursor-not-ok");
            }
        }

        // hover masters
        $scope.mouseoverMaster = function(master) {
            if (master.display || master.edit) {
                var current = $(".specimen-field-master ul li.master-" + master.name);
                $(".specimen-field-masters ul li").not(current).each(function() {
                    $(this).addClass("dimmed");
                });
            }
        };

        $scope.mouseleaveMaster = function() {
            $(".specimen-field-masters ul li").removeClass("dimmed");
        };
    }

    MasterPanelController.$inject = ['$scope', '$element', 'project'];
    // var _p = MasterPanelController.prototype;

    return MasterPanelController;
});
