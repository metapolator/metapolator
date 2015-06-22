define([], function() {
    "use strict";
    function MasterPanelController($scope, metapolatorModel) {
        this.$scope = $scope;
        this.$scope.name = 'masterPanel';
        $scope.instancePanel = metapolatorModel.instancePanel;
        
        $scope.importUfo = function () {
            var message = "Want to load your own UFO?<br><br>Show us you want this by buying a T shirt:<br><ul><li><a title='Support the project and buy a T shirt (USA)' href='http://teespring.com/metapolator-beta-0-3-0' target='_blank' class='newtab'>USA</a></li><li><a title='Support the project and buy a T shirt (Worldwide)' href='http://metapolator.spreadshirt.com' target='_blank' class='newtab'>Worldwide</a></li>";
            metapolatorModel.display.dialog.openDialogScreen(message, false, false, true);  
        };
       
        
        $scope.addMasterToDesignSpace = function (master) {
            window.logCall("addMasterToDesignSpace");
            var designSpace = metapolatorModel.designSpacePanel.currentDesignSpace;
            var axes = designSpace.axes, axisValue = null;
            if (axes.length == 0) {
                axisValue = 50;
                designSpace.addAxis(master);
                var axes = [{
                    master: master,
                    axisValue: axisValue
                }];
                $scope.instancePanel.sequences[0].addInstance(axes, designSpace);
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
                if (IsOverDropArea(ui)) {
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
    
                if (IsOverDropArea(ui) && !isInDesignSpace(master)) {
                    // push master to design space when dropped on drop-area
                    $scope.addMasterToDesignSpace(master);
                    $scope.$apply();
                }
                $(".drop-area").removeClass("drag-over");
            }
        };
        
        function IsOverDropArea(master) {
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
                if (masterInDS == master) {
                    return true;
                }   
            }
            return false;
        }
        
        //cursorhelper functions
        var cursorHelper = false;
        var templayer = $('<div class="cursor-helper"></div>')[0]; 
    
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
                $(templayer).html("+");
                $(templayer).removeClass("cursor-not-ok");
            } else {
                $(templayer).html("×");
                $(templayer).addClass("cursor-not-ok");  
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

    MasterPanelController.$inject = ['$scope', 'metapolatorModel'];
    var _p = MasterPanelController.prototype;

    return MasterPanelController;
}); 