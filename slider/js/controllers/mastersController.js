app.controller("mastersController", function($scope, sharedScope) {
    'use strict';
    $scope.data = sharedScope.data;

    /*
     $scope.mouseclick = false;
     $scope.mouseDown = false;
     $scope.commandDown = false;
     $scope.controlDown = false;
     $scope.shiftDown = false;
     $scope.startDiamond
     $scope.lastDiamond

     $(window).keydown(function(e) {
     if (e.metaKey) {
     $scope.commandDown = true;
     }
     if (e.shiftKey) {
     $scope.shiftDown = true;
     }
     if (e.ctrlKey) {
     $scope.controlDown = true;
     }
     });

     $(window).keyup(function(e) {
     $scope.commandDown = false;
     $scope.controlDown = false;
     $scope.shiftDown = false;
     });

     // sequences column
     $scope.mastersSeqCache = [];
     $scope.startDrag = function(thisMaster, nr) {
     $scope.mouseclick = true;
     $scope.startDiamond = nr;
     // put stuff in a cache
     angular.forEach($scope.masters, function(master, key) {
     $scope.mastersSeqCache[key] = master.seq;
     });
     };

     $scope.whileDrag = function(thisMaster, nr) {
     if ($scope.mouseclick) {
     $scope.lastDiamond = nr;
     $scope.makeSequence();
     }
     };

     $scope.allMastersSelected = function(thisSequence) {
     var i = 0;
     var hit = 0;
     angular.forEach(thisSequence.masters, function(master) {
     if (master.edit == true) {
     hit++;
     }
     i++;
     });
     if (hit == i && i != 0) {
     return true;
     }
     };

     $scope.selectionStart = [0, 0];
     $scope.selectionEnd = [];

     $scope.selectMastersForEdit = function(thisMaster, sIndex, mIndex) {
     if ($scope.commandDown || $scope.controlDown) {// toggle on ctrl click
     thisMaster.edit = !thisMaster.edit;
     $scope.selectionStart = [sIndex, mIndex];
     } else if ($scope.shiftDown) {// set end for shift click
     $scope.selectionEnd = [sIndex, mIndex];
     $scope.selectSet();
     } else {// clean click clears all but current
     $scope.selectionStart = [sIndex, mIndex];
     $scope.deselectAll();
     thisMaster.edit = true;
     }
     };

     $scope.selectSequenceForEdit = function(thisSequence) {
     $scope.deselectAll();
     angular.forEach(thisSequence.masters, function(master) {
     master.edit = true;
     });
     };

     $scope.selectSet = function() {
     var countStart = [];
     var countEnd = [];
     // deselect all
     $scope.deselectAll();
     // check if selection is upwards or downwards
     if ($scope.selectionStart[0] * 10 + $scope.selectionStart[1] > $scope.selectionEnd[0] * 10 + $scope.selectionEnd[1]) {
     countStart = $scope.selectionEnd;
     countEnd = $scope.selectionStart;
     } else {
     countStart = $scope.selectionStart;
     countEnd = $scope.selectionEnd;
     }
     // walk through sequences.masters
     for (var i = countStart[0]; i < countEnd[0] + 1; i++) {
     // first sequence in selection
     if (i == countStart[0]) {
     for (var j = countStart[1]; j < $scope.data.sequences[i].masters.length; j++) {
     $scope.data.sequences[i].masters[j].edit = true;
     }
     // last sequence in selection
     } else if (i == countEnd[0]) {
     for (var j = 0; j < countEnd[1] + 1; j++) {
     $scope.data.sequences[i].masters[j].edit = true;
     }
     // middle sequences
     } else {
     for (var j = 0; j < $scope.data.sequences[i].masters.length; j++) {
     $scope.data.sequences[i].masters[j].edit = true;
     }
     }
     }
     };

     */

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
        designspace.masters.push({
            masterId : master.id,
            value : null
        });
        if (masterSet.length > 1) {
            designspace.axes.push({
                value : 50
            });
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