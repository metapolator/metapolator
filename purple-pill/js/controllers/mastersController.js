app.controller("mastersController", function($scope, sharedScope) {
    'use strict';
    $scope.data = sharedScope.data;

    /***** menu control *****/

    $scope.deleteMaster = function(){
        // need to make functionality to go through design spaces and instances to remove masters as well
        // and in instances recalculate the metap values
        if (confirm("You are about to remove master(s). This could affect design spaces as well. Ok?")) {
            angular.forEach($scope.data.sequences, function(sequence) {
                var notDeleted = [];
                angular.forEach(sequence.masters, function(master) {
                    if (!master.edit){
                        notDeleted.push(master);
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
    
    $scope.data.alert = function (message, loading) {
        $("#alert").show();
        if (loading) {
            $("#alert-loading").show();
        }
        $("#alert #alert-content").html(message);
        setTimeout(function(){ $("#alert").hide(); }, 2000);
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
                    master.edit = !master.edit;
                    master.display = master.edit;
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
                    master.edit = true;
                    master.display = true;
                } else {
                    master.edit = false;
                    master.display = false;
                }
            });
        });
        $scope.data.updateParameters();
    };

    $scope.deselectAll = function() {
        angular.forEach($scope.data.sequences, function(sequence) {
            angular.forEach(sequence.masters, function(master) {
                master.edit = false;
                master.display = false;
            });
        });
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
                    if ($scope.data.currentDesignSpace.type == "Control") {
                        addMasterToDesignSpace(master);
                    } else if ($scope.data.currentDesignSpace.type == "Explore") {
                        // get relative mouse position of where dropped
                        var mouseX = e.clientX - Math.round($(".drop-area").offset().left) - 10;
                        var mouseY = e.clientY - Math.round($(".drop-area").offset().top) - 10;
                        $scope.data.currentDesignSpace.masters.push({
                            masterId : master.id,
                            value : 0,
                            coordinates : [mouseX, mouseY]
                        });
                    }
                    $scope.$apply();
                }
            }
            $(".drop-area").removeClass("drag-over");
        }
    };

    function addMasterToDesignSpace(master) {
        var designspace = $scope.data.currentDesignSpace;
        var masterSet = designspace.masters;
        var startValue = 0;
        // for first two master give value 0.5, so first instance has right values
        if (masterSet.length < 2) {
            startValue = 0.5;
        } 
        designspace.masters.push({
            masterId : master.id,
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
