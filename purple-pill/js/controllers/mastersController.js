app.controller("mastersController", function($scope, sharedScope) {
    'use strict';
    $scope.data = sharedScope.data;

    /***** menu control *****/
   
    $scope.uniqueMasterId = 0;

    $scope.deleteMasters = function(){
        // need to make functionality to go through design spaces and instances to remove masters as well
        // and in instances recalculate the metap values
        if (confirm("You are about to remove master(s). This could affect design spaces as well. Ok?")) {
            angular.forEach($scope.data.sequences, function(sequence) {
                var notDeleted = [];
                angular.forEach(sequence.masters, function(master) {
                    if (!master.edit[$scope.data.viewState]){
                        notDeleted.push(master);
                    } else {
                        $scope.data.stateful.project.deleteMaster(master.name);
                        // empty cps file
                        $scope.data.stateful.project.ruleController.write(false, master.cpsFile, ""); 
                    }
                });
                sequence.masters = notDeleted;
            }); 
        }
        $scope.data.localmenu.masters = false;
    };
    
    $scope.importUfo = function () {
        $scope.data.alert("Loading. Your UFO is coming soon.", true);
        $scope.data.localmenu.masters = false;
    };
        
    $scope.duplicateMasters = function () {
        angular.forEach($scope.data.sequences, function(sequence) {
            angular.forEach(sequence.masters, function(master) {
                if (master.type == "redpill" && master.edit[0]) {
                    $scope.uniqueMasterId++;
                    var masterName = "master" + $scope.uniqueMasterId;
                    var cpsFile = masterName + ".cps";
                    // duplicate cps file
                    var sourceCollection = $scope.data.stateful.controller.getMasterCPS(false, master.name);
                    var cpsString = "" + sourceCollection;
                    // create new cps file and new master
                    $scope.data.stateful.project.ruleController.write(false, cpsFile, cpsString); 
                    $scope.data.stateful.project.createMaster(masterName, cpsFile, "skeleton.base");
                    $scope.data.stateful.project.open(masterName);
                    $scope.data.sequences[0].masters.push({
                        id: $scope.uniqueMasterId,
                        name: masterName,
                        displayName: masterName,
                        cpsFile: cpsFile,
                        type: "redpill",
                        display: true,
                        edit: [true, true],
                        ag: "ag",
                        glyphs: angular.copy(master.glyphs),
                        parameters: angular.copy(master.parameters)
                    });
                }
            });
        });
        $scope.data.localmenu.masters = false;
    };
   

    /***** selecting *****/

    $scope.mouseDown = false;
    
    $scope.toggleViewSet = function(set, initialDisplay) {
        if (initialDisplay == "true") {
            var newStatus = false;
        } else {
            var newStatus = true;
        }
        angular.forEach($scope.data.sequences, function(sequence) {
            angular.forEach(sequence.masters, function(master) {
                var hit = false;
                angular.forEach(set, function(selection) {
                    if (selection.parentObject == sequence.id && selection.childObject == master.id) {
                        hit = true;
                    }
                });
                if (hit) {
                    master.display = newStatus;
                }
            });
        }); 
    };

    $scope.toggleEdit = function(listItem) {
        angular.forEach($scope.data.sequences, function(sequence) {
            angular.forEach(sequence.masters, function(master) {
                if (listItem.parentObject == sequence.id && listItem.childObject == master.id) {
                    master.edit[$scope.data.viewState] = !master.edit[$scope.data.viewState];
                    master.display = master.edit[$scope.data.viewState];
                }
            });
        });  
        $scope.data.updateParameters();
    };

    $scope.selectEdit = function(set) {
        angular.forEach($scope.data.sequences, function(sequence) {
            angular.forEach(sequence.masters, function(master) {
                var hit = false;
                angular.forEach(set, function(selection) {
                    if (selection.parentObject == sequence.id && selection.childObject == master.id) {
                        hit = true;
                    }
                });
                if (hit) {
                    master.edit[$scope.data.viewState] = true;
                    master.display = true;
                } else {
                    master.edit[$scope.data.viewState] = false;
                }
            });
        });
    };

    $scope.deselectAll = function() {
        angular.forEach($scope.data.sequences, function(sequence) {
            angular.forEach(sequence.masters, function(master) {
                master.edit[$scope.data.viewState] = false;
                master.display = false;
            });
        });
    };
    
    $scope.toggleDisplay = function(master) {
        if(!master.edit[$scope.data.viewState]) {
            master.display = !master.display;
        }
    };

    /***** Dropping to design space *****/

    $scope.sortableOptionsSequences = {
        helper : 'clone',
        handle : '.sequence-name'
    };

    $scope.sortableOptionsMasters = {
        //cancel : '.no-drag, .drop-area, .diamond, .sequence-name',
        handle : '.list-edit-col',
        helper : 'clone',
        connectWith : '.drop-area, .sequence',
        sort : function(e, ui) {
            if (IsOverDropArea(ui)) {
                $(".drop-area").addClass("drag-over");
            } else {
                $(".drop-area").removeClass("drag-over");
            }
        },
        update : function(e, ui) {
        },
        stop : function(e, ui) {
            // push master to design space when dropped on drop-area
            if (IsOverDropArea(ui)) {
                // check which master is dropped
                var sequenceIndex = ui.item.parent().parent().index();
                var masterIndex = ui.item.index();
                var master = $scope.data.sequences[sequenceIndex].masters[masterIndex];
                // check if master already in this designspace
                if (isInDesignSpace(master.id)) {
                    alert("master already in this Design Space");
                } else {
                    addMasterToDesignSpace(master);
                    $scope.$apply();
                }
            }
            $(".drop-area").removeClass("drag-over");
        }
    };

    function addMasterToDesignSpace(master) {
        var designspace = $scope.data.currentDesignSpace;
        if ($scope.data.currentDesignSpace.type == "x") {
            $scope.data.currentDesignSpace.type = "Control";
        }
        var masterSet = designspace.masters;
        var startValue = 0;
        // for first two master give value 0.5, so first instance has right values
        if (masterSet.length < 2) {
            startValue = 0.5;
        } 
        designspace.masters.push({
            masterId : master.id,
            masterName: master.name,
            value : startValue
        });
        if (masterSet.length > 1) {
            designspace.axes.push({
                value : 50
            });
            // add this axis to each instance in the design space
            $scope.data.addAxisToInstance(master.id);
        }
        if (designspace.axes.length == 1) {
           $scope.data.addInstance(); 
        }
    }

    function isInDesignSpace(id) {
        var x = false;
        for (var i = 0; i < $scope.data.currentDesignSpace.masters.length; i++) {
            if ($scope.data.currentDesignSpace.masters[i].masterId == id) {
                x = true;
                break;
            }
        }
        return x;
    }

    function IsOverDropArea(ui) {
        var dropLeft = $(".drop-area").offset().left;
        var dropRight = $(".drop-area").offset().left + $(".drop-area").outerWidth();
        var dropTop = $(".drop-area").offset().top;
        var dropBottom = $(".drop-area").offset().top + $(".drop-area").outerHeight();

        var thisLeft = ui.offset.left;
        var thisRight = ui.offset.left + ui.item.outerWidth();
        var thisTop = ui.offset.top;
        var thisBottom = ui.offset.top + ui.item.outerHeight();

        var marginHor = ui.item.outerWidth() / 2;
        var marginVer = ui.item.outerHeight() / 2;

        if (dropLeft < (thisLeft + marginHor) && dropRight > (thisRight - marginHor) && dropTop < (thisTop + marginVer) && dropBottom > (thisBottom - marginVer)) {
            return true;
        } else {
            return false;
        }
    }

});
