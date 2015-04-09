app.controller('designspaceController', function($scope, $http, sharedScope) {
    $scope.data = sharedScope.data;

    $scope.data.currentDesignSpace = $scope.data.designSpaces[0];
    $scope.designSpaceWidth;
    
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
        
    $scope.data.duplicateMasters = function () {
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
        $scope.data.updateSelectionParameters();
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
        $scope.data.updateSelectionParameters();
    };

    $scope.deselectAll = function() {
        angular.forEach($scope.data.sequences, function(sequence) {
            angular.forEach(sequence.masters, function(master) {
                master.edit[$scope.data.viewState] = false;
                master.display = false;
            });
        });
        $scope.data.updateSelectionParameters();
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
                if (isInDesignSpace(master.name)) {
                    alert("master already in this Design Space");
                } else {
                    addMasterToDesignSpace(master);
                    $scope.$apply();
                }
            }
            $(".drop-area").removeClass("drag-over");
        }
    };

    $scope.data.addMasterToDesignSpace = function(master) {
        var designspace = $scope.data.currentDesignSpace;
        if ($scope.data.currentDesignSpace.type == "x") {
            $scope.data.currentDesignSpace.type = "Control";
        }
        var thisValue = 50;
        if (designspace.axes.length == 1) {
           thisValue = 100 -  designspace.axes[0].value;
        }
        designspace.axes.push({
            masterName : master.name,
            masterdisplayName: master.displayName,
            value : thisValue,
            metapValue : 1
        });
        $scope.data.addAxisToInstance(master, thisValue);
        if (designspace.axes.length == 1) {
           $scope.data.addInstance(); 
        }
    };

    function isInDesignSpace(masterName) {
        var x = false;
        for (var i = 0; i < $scope.data.currentDesignSpace.axes.length; i++) {
            if ($scope.data.currentDesignSpace.axes[i].masterName == masterName) {
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

    $scope.data.findMaster = function(masterName) {
        for (var i = 0; i < $scope.data.sequences.length; i++) {
            for (var j = 0; j < $scope.data.sequences[i].masters.length; j++) {
                if ($scope.data.sequences[i].masters[j].name == masterName) {
                    return $scope.data.sequences[i].masters[j];
                    break;
                }
            }
        }
    };

    $scope.selectDesignSpace = function(designSpace) {
        $scope.data.currentDesignSpace = designSpace;
        var id = designSpace.id;
        // set last instance of this design space as current instance
        var instanceInSpace = null;
        angular.forEach($scope.data.families, function(family) {
            angular.forEach(family.instances, function(instance) {
                if (instance.designSpace == id) {
                    instanceInSpace = instance;
                }
            });
        });
        $scope.data.deselectAllEdit();
        if (instanceInSpace) {
            $scope.data.currentInstance = instanceInSpace;
            $scope.data.currentInstance.edit = true;
            $scope.data.currentInstance.display = true;  
        }
    };
    
    $scope.addDesignSpace = function() {
        var id = findDesignSpaceId();
        $scope.data.designSpaces.push({
            name : "Space " + id,
            id : id,
            type : "x",
            axes : [],
            mainMaster : 1,
            trigger : 0 //this is to trigger the designspace to redraw when a master is renamed
        });
        $scope.data.currentDesignSpace = $scope.data.designSpaces[($scope.data.designSpaces.length - 1)];
        $scope.data.deselectAllEdit();
        $scope.data.currentInstance = null;
        $scope.data.localmenu.designspace = false;
    };

    $scope.removeDesignSpace = function () {
        if (confirm("This will remove all Instances in this Design Space. Sure?")) {
            $scope.data.designSpaces.splice($scope.data.designSpaces.indexOf($scope.data.currentDesignSpace), 1);
            $scope.data.deleteInstanceDirect($scope.data.currentDesignSpace.id);
            var lastDesignspace;
            angular.forEach($scope.data.designSpaces, function(space) {
                lastDesignspace = space;            
            });
            $scope.selectDesignSpace(lastDesignspace);
            $scope.data.localmenu.designspace = false;
        }  
    };
    
    $scope.duplicateDesignSpace = function () {
        var duplicate = jQuery.extend(true, {}, $scope.data.currentDesignSpace);
        var oldId = duplicate.id;
        var duplicateId = findDesignSpaceId();
        duplicate.name += " copy";
        duplicate.id = duplicateId;
        $scope.data.designSpaces.push(duplicate);
        $scope.data.currentDesignSpace = $scope.data.designSpaces[($scope.data.designSpaces.length - 1)];
        // duplicate its instances
        var toBeDuplicated = [];
        angular.forEach($scope.data.families, function(family) {
            angular.forEach(family.instances, function(instance) {
                if (instance.designSpace == oldId) {
                    toBeDuplicated.push(instance);
                }
            });
        }); 
        angular.forEach(toBeDuplicated, function(duplicate) {
            $scope.data.duplicateInstance(duplicate, duplicateId);
        });  
        $scope.data.localmenu.designspace = false;
    };

    function findDesignSpaceId() {
        var max = 0;
        for (var i = 0; i < $scope.data.designSpaces.length; i++) {
            if ($scope.data.designSpaces[i].id > max) {
                max = $scope.data.designSpaces[i].id;
            }
        }
        max++;
        return max;
    }


    $scope.output = [];
    $scope.total = 0;

    $scope.getMetapolationRatios = function() {
        var instance = $scope.data.currentInstance;
        var axes = instance.axes;
        var n = axes.length;
        var cake = 0;
        for (var i = 0; i < n; i++) {
            cake += parseInt(axes[i].value);
        }
        for (var i = 0; i < n; i++) {
            var piece = parseInt(axes[i].value);
            instance.axes[i].metapValue = piece / cake;
        }
    };

    function roundup(a) {
        var b = Math.round(a * 1000) / 1000;
        return b;
    }

    //

    $scope.removeMaster = function(m) {
        var designspace = $scope.data.currentDesignSpace;
        var axesSet = designspace.axes;
        if (confirm("Removing master from this Design Space, and also from all Instances in this Design Space. Sure?")) {
            // remove master from all instances in this design space
            angular.forEach($scope.data.families, function(family) {
                angular.forEach(family.instances, function(instance) {
                    if (instance.designSpace == designspace.id) {
                        // remove axis from instance
                        instance.axes.splice(m, 1);
                        reDistributeValues(instance.axes);
                        reDestributeAxes(instance.axes);
                    }
                });
            });
            // remove the master from the designspace
            designspace.axes.splice(m, 1);
            $scope.$apply();
        }
        // reassigning the key of mainmaster
        if (m < designspace.mainMaster) {
            designspace.mainMaster--;   
        }
    };
    
    function reDestributeAxes(axes) {
        var designspace = $scope.data.currentDesignSpace;
        var slack = designspace.mainMaster;
        // 1 find highest of the others
        var max = 0;
        var highest;
        for (var i = 0; i < axes.length; i++) {
            if (parseFloat(axes[i].value) > max && i != slack) {
                highest = i;
                max = parseFloat(axes[i].value);
            }
        }
        // 2 find ratio of others compared to highest
        var ratio = 100 / (parseFloat(axes[highest].value) + parseFloat(axes[slack].value));
        for (var i = 0; i < axes.length; i++) {
            axes[i].value = formatX(ratio * axes[i].value);
        }
    }

    function reDistributeValues(axes) {
        var totalValue = 0;
        angular.forEach(axes, function(axis) {
            totalValue += axis.metapValue;
        });
        var addFactor = 1 / totalValue;
        angular.forEach(axes, function(axis) {
            axis.metapValue *= addFactor;
        });
    }


    $scope.changeMainMaster = function() {
        var designspace = $scope.data.currentDesignSpace;
        var slack = designspace.mainMaster;
        // swop main master in each instance in the design space
        angular.forEach($scope.data.families, function(family) {
            angular.forEach(family.instances, function(instance) {
                if (instance.designSpace == designspace.id) {
                    reDestributeAxes(instance.axes);
                }
            });
        });   
        // trigger the designspace to redraw
        $scope.data.currentDesignSpace.trigger++;
    };

    function formatX(x) {
        var roundedX = Math.round(x * 2) / 2;
        var toF = roundedX.toFixed(1);
        return toF;
    }

    function roundupsmall(a) {
        var b = Math.round(a * 10) / 10;
        return b;
    }
    
    $scope.redrawAxesFromInput = function (inputAxis) {
        var slack = $scope.data.currentDesignSpace.mainMaster;
        var instance = $scope.data.currentInstance;
        var axes = instance.axes;
        // prevent input beyond 0 - 100 or NaN
        for (var i = 0; i < axes.length; i++) {
            if (isNaN(axes[i].value) || axes[i].value == "") {
                axes[i].value = 0;
            }
            if (axes[i].value > 100) {
                axes[i].value = 100;
            }
            if (axes[i].value < 0) {
                axes[i].value = 0;
            }
        }
        // when 2 master situation, 1 follows 0
        if (axes.length == 2) {
            axes[1].value = 100 - axes[0].value;
        }
        if (axes.length > 2) {
            var max = 0;
            for (var i = 0; i < axes.length; i++) {
                if (parseFloat(axes[i].value) >= max && i != slack) {
                    max = parseFloat(axes[i].value);
                }
            }
            if (inputAxis != slack) {
                // correct the slack behaviour
                axes[slack].value = 100 - max;
            } else {
                var newMax = 100 - axes[slack].value;
                if (max != 0) {
                    var ratio = newMax / max;
                } else {
                    var ratio = 1;
                }
                // correct all sliders but slack proportionally
                for (var i = 0; i < axes.length; i++) {
                    if (i != slack) {
                        axes[i].value = formatX(ratio * axes[i].value);
                    }
                }
            }
        }
        $scope.getMetapolationRatios();
        $scope.data.currentDesignSpace.trigger++;  
    };
    

});
