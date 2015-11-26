define([
    'jquery'
  , 'metapolator/ui/metapolator/ui-tools/instanceTools'
  , 'metapolator/ui/metapolator/ui-tools/dialog'
  , 'metapolator/ui/metapolator/ui-tools/selectionTools'
  , 'require/text!metapolator/cpsLib/metapolator/ui-master.cps'
], function(
    $
  , instanceTools
  , dialog
  , selection
  , cpsUIMasterTemplate
) {
    "use strict";
    function MasterPanelController($scope, project) {
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
                      , clones = [];
                    for (var j = 0, jl = sequence.children.length; j < jl; j++) {
                        var master = sequence.children[j];
                        master.deselectAllChildren();
                        // todo: change [0] to [viewState]
                        if (master.edit) {
                            var clone = master.clone()
                              , copiedCPSstring
                              , newId = sequence.addToMasterId();
                            setCloneProperties(clone, newId);
                            copiedCPSstring = copyCPSString(master);
                            registerMaster(clone, copiedCPSstring);
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
                    }
                    for (var m = 0, ml = clones.length; m < ml; m++) {
                        sequence.add(clones[m]);
                    }
                }
                selection.updateSelection('master');
            }
        };

        function setCloneProperties(clone, id) {
            clone.id = id;
            clone.setMaster(clone);
            clone.displayName = nameCopy(clone.displayName);
            // giving it a unique name before registering
            clone.name = "master-" + clone.sequenceId + "-" + clone.id;
            clone.cpsFile = clone.name + ".cps";
        }


        function registerMaster(master, cpsString) {
            project.ruleController.write(false, master.cpsFile, cpsString);
            project.createMaster(master.name, master.cpsFile, 'skeleton.base');
            project.open(master.name);
        }

        function copyCPSString(master) {
            // use the old name to get the cpsString
            var sourceCollection = project.controller.getMasterCPS(false, master.name);
            return "" + sourceCollection;
        }

        function nameCopy (name) {
            // todo: put some more intelligence in here
            return name + " copy";
        }

        $scope.handleUFOimportFiles = function(element) {
            var ufozipfile = element.files[0]
              , reader = new FileReader()
              ;
            dialog.openDialogScreen("Importing UFO ZIP...", true);

            reader.onload = function(e) {
                var baseMasterPrefix = 'base-'
                  , uiMasterPrefix = 'master-'
                  , importedMasters = project.importZippedUFOMasters(e.target.result, baseMasterPrefix)
                  , i, l
                  , cpsFile
                  , baseMaster
                  , uiMasterName
                  , uiMaster
                  , momMaster
                  ;
                for (i=0, l=importedMasters.length; i<l; i++) {
                    baseMaster = importedMasters[i];
                    uiMasterName = uiMasterPrefix + (baseMaster.name.slice(baseMasterPrefix.length));
                    cpsFile = uiMasterName + '.cps';
                    project.ruleController.write(false, cpsFile, cpsUIMasterTemplate);
                    project.createMaster(uiMasterName, cpsFile, baseMaster.skeleton
                          , { baseMaster: 'S"master#' + baseMaster.name + '"' });
                    momMaster= project.getMOMMaster(uiMasterName);
                    // TODO: This could be done by listening to univers
                    // (if univers would emit this kind of events)
                     $scope.model.masterSequences[0].addMaster(uiMasterName, momMaster, cpsFile);
                }

                $scope.importUfo_dialog_close();
                dialog.closeDialogScreen();
                $scope.$apply();
            };
            reader.readAsArrayBuffer(ufozipfile);
        };

        $scope.importUfo_dialog_open = function() {
            $("#importufo_dialog").css("display", "block");
        };

        $scope.importUfo_dialog_close = function() {
            $("#importufo_dialog").css("display", "none");
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
                var newInstance = $scope.model.instanceSequences[0].createNewInstance(instanceAxes, designSpace, project);
                instanceTools.registerInstance(project, newInstance);
                $scope.model.instanceSequences[0].addInstance(newInstance);
            }  else {
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
                            instanceTools.updateCPSfile(project, instance);
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

    MasterPanelController.$inject = ['$scope', 'project'];
    var _p = MasterPanelController.prototype;

    return MasterPanelController;
}); 
