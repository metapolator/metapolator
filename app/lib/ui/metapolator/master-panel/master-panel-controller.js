define([
    'jquery'
  , 'metapolator/ui/metapolator/services/instanceTools'
], function(
    $
  , instanceTools
) {
    "use strict";
    function MasterPanelController($scope, metapolatorModel, project) {
        this.$scope = $scope;
        this.$scope.name = 'masterPanel';
        $scope.instancePanel = metapolatorModel.instancePanel;

        $scope.duplicateMasters = function() {
            for (var i = 0, l = $scope.model.sequences.length; i < l; i++) {
                var sequence = $scope.model.sequences[i]
                  , clones = [];
                for (var j = 0, jl = sequence.children.length; j < jl; j++) {
                    var master = sequence.children[j];
                    // todo: change [0] to [viewState]
                    if (master.edit[0]) {
                        // todo: clone the objects and arrays like 'edit', 'parameters' and 'operators' properly, so they are no longer references
                        var clone = master.clone()
                          , copiedCPSstring;
                        setCopyProperties(clone);
                        copiedCPSstring = copyCPSString(master);
                        registerMaster(clone, copiedCPSstring);
                        clones.push(clone);
                    }
                }
                for (var k = 0, kl = clones.length; k < kl; k++) {
                    sequence.add(clones[k]);
                }
            }
        };

        function setCopyProperties(clone) {
            clone.displayName = nameCopy(clone.displayName);
            // giving it a unique name before registering
            clone.name = "master-" + clone.id + "-" + clone.sequenceId;
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
            return name + " copy";
        }
        
        $scope.importUfo = function () {
            var message = "Want to load your own UFO?<br><br>Show us you want this by buying a T shirt:<br><ul><li><a title='Support the project and buy a T shirt (USA)' href='http://teespring.com/metapolator-beta-0-3-0' target='_blank' class='newtab'>USA</a></li><li><a title='Support the project and buy a T shirt (Worldwide)' href='http://metapolator.spreadshirt.com' target='_blank' class='newtab'>Worldwide</a></li>";
            metapolatorModel.display.dialog.openDialogScreen(message, false, false, true);  
        };
        
        $scope.addMasterToDesignSpace = function (master) {
            var designSpace = metapolatorModel.designSpacePanel.currentDesignSpace
              , axes = designSpace.axes
              , axisValue = null
              , instanceAxes;
            if (axes.length === 0) {
                axisValue = 50;
                designSpace.addAxis(master);
                instanceAxes = [{
                    master: master,
                    axisValue: axisValue
                }];
                var newInstance = $scope.instancePanel.sequences[0].createInstance(instanceAxes, designSpace);
                instanceTools.registerInstance(project, newInstance);
                $scope.instancePanel.sequences[0].addInstance(newInstance);
            }  else {
                designSpace.addAxis(master);
                // add this axes to each instance in the design space
                for (var i = $scope.instancePanel.sequences.length - 1; i >= 0; i--) {
                    var sequence = $scope.instancePanel.sequences[i];
                    for (var j = sequence.children.length - 1; j >= 0; j--) {
                        var instance = sequence.children[j];
                        if (instance.designSpace == designSpace) {
                            if (instance.axes.length == 1) {
                                axisValue = 100 - instance.axes[0].axisValue;
                            } else {
                                axisValue = 0;
                            }
                            instance.addAxis(master, axisValue, null);    
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
        }
        
        function isInDesignSpace(master) {
            var designSpace = metapolatorModel.designSpacePanel.currentDesignSpace;
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
            if (master.display || master.edit[0]) {
                var current = $(".specimen-field-masters ul li.master-" + master.name);
                $(".specimen-field-masters ul li").not(current).each(function() {
                    $(this).addClass("dimmed");
                });
            }
        };
    
        $scope.mouseleaveMaster = function() {
            $(".specimen-field-masters ul li").removeClass("dimmed");
        };
    }

    MasterPanelController.$inject = ['$scope', 'metapolatorModel', 'project'];
    var _p = MasterPanelController.prototype;

    return MasterPanelController;
}); 