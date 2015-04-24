app.controller("mastersController", function($scope, sharedScope) {
    'use strict';
    $scope.data = sharedScope.data;

    /***** menu control *****/

    $scope.uniqueMasterId = 0;

    $scope.deleteMasters = function() {
        var thisIndex;
        // check nr of masters and nr of desing spaces they use
        var nMasters = 0;
        var nDesignspaces = [];
        angular.forEach($scope.data.sequences, function(sequence) {
            angular.forEach(sequence.masters, function(master) {
                if (master.edit[$scope.data.view.viewState]) {
                    nMasters++;
                    angular.forEach($scope.data.designspaces, function(designspace) {
                        angular.forEach(designspace.axes, function(axis) {
                            if (axis.masterName == master.name) {
                                // prevent double pushing (other master on same DS)
                                if (nDesignspaces.indexOf(designspace.name) == -1) {
                                    nDesignspaces.push(designspace.name);
                                }
                            }
                        });
                    });
                }
            });
        });

        if (nDesignspaces.length == 0) {
            if (nMasters == 1) {
                var message = "Delete master?";
            } else {
                var message = "Delete " + nMasters + " masters?";
            }
        } else {
            if (nMasters == 1) {
                if (nDesignspaces.length == 1) {
                    var message = "Delete master? It is in use on design space '" + nDesignspaces[0] + "' and will no longer be part of its instances after deleting.";
                } else {
                    var message = "Delete master? It is in use on " + nDesignspaces.length + " design spaces and will no longer be part of their instances after deleting.";
                }
            } else {
                if (nDesignspaces.length == 1) {
                    var message = "Delete " + nMasters + "  masters? They are in use on design space '" + nDesignspaces[0] + "' and will no longer be part of its instances after deleting.";
                } else {
                    var message = "Delete " + nMasters + "  masters? They are in use on " + nDesignspaces.length + " design spaces and will no longer be part of their instances after deleting.";
                }
            }
        }
        // close menu
        $scope.data.localmenu.masters = false;
        if (confirm(message)) {
            angular.forEach($scope.data.sequences, function(sequence) {
                var notDeleted = [];
                angular.forEach(sequence.masters, function(master, index) {
                    if (!master.edit[$scope.data.view.viewState]) {
                        notDeleted.push(master);
                    } else {
                        thisIndex = index;
                        if (nDesignspaces.length > 0) {
                            $scope.data.removeMasterFromEachDesignspaces(master.name);
                        }
                        if ($scope.data.pill != "blue") {
                            $scope.data.stateful.project.deleteMaster(master.name);
                            // empty cps file to prevent caching issues
                            $scope.data.stateful.project.ruleController.write(false, master.cpsFile, "");
                        }
                    }
                });
                sequence.masters = notDeleted;
            });
        }
        // after deleting all selected masters, select a new master
        var n = $scope.data.sequences[0].masters.length;
        if (n <= thisIndex) {
            $scope.data.sequences[0].masters[n - 1].edit[$scope.data.view.viewState] = true;
        } else {
            $scope.data.sequences[0].masters[thisIndex].edit[$scope.data.view.viewState] = true;
        }

    };

    $scope.importUfo = function() {
        var message = "Loading UFOs is coming soon. Click to <a href='' target='_blank'>support the Metapolator project</a>.";
        $scope.data.dialog(message, false, "close");
        $scope.data.localmenu.masters = false;
    };

    $scope.duplicateMasters = function() {
        angular.forEach($scope.data.sequences, function(sequence) {
            angular.forEach(sequence.masters, function(master) {
                if (master.edit[$scope.data.view.viewState]) {
                    // deselect this one
                    master.edit[$scope.data.view.viewState] = false;
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
                        id : $scope.uniqueMasterId,
                        name : masterName,
                        displayName : masterName,
                        cpsFile : cpsFile,
                        ruleIndex : angular.copy(master.ruleIndex),
                        display : false,
                        edit : [true, true],
                        ag : angular.copy(master.ag),
                        glyphs : angular.copy(master.glyphs),
                        parameters : angular.copy(master.parameters)
                    });
                }
            });
        });
        // close menu
        $scope.data.localmenu.masters = false;
    };

    /***** hover instances *****/

    $scope.mouseoverMaster = function(master) {
        if (master.display || master.edit[0]) {
            var id = master.id;
            $("specimen #specimen-content ul li").each(function() {
                var thisId = $(this).find("glyph").attr("master");
                if (thisId != id) {
                    $(this).addClass("dimmed");
                }
            });
        }
    };

    $scope.mouseleaveMaster = function(master) {
        var id = master.id;
        $("specimen #specimen-content ul li").each(function() {
            var thisId = $(this).find("glyph").attr("master");
            if (thisId != id) {
                $(this).removeClass("dimmed");
            }
        });
    };

    /***** selecting *****/

    $scope.mouseDown = false;

    $scope.toggleViewSet = function(selectedSet, initialDisplay) {
        if (initialDisplay == "true") {
            var newStatus = false;
        } else {
            var newStatus = true;
        }
        angular.forEach($scope.data.sequences, function(sequence) {
            angular.forEach(sequence.masters, function(master) {
                var hit = false;
                angular.forEach(selectedSet, function(selection) {
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
                    master.edit[$scope.data.view.viewState] = !master.edit[$scope.data.view.viewState];
                    if (master.edit[$scope.data.view.viewState] == false) {
                        $scope.deselectAllGlyphs(master);
                    }
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
                    master.edit[$scope.data.view.viewState] = true;
                } else {
                    master.edit[$scope.data.view.viewState] = false;
                    $scope.deselectAllGlyphs(master);
                }
            });
            $scope.data.updateSelectionParameters();
        });
    };

    $scope.deselectAll = function() {
        if ($scope.data.view.viewState == 0) {
            angular.forEach($scope.data.sequences, function(sequence) {
                angular.forEach(sequence.masters, function(master) {
                    master.edit[$scope.data.view.viewState] = false;
                    $scope.deselectAllGlyphs(master);
                });
            });
            $scope.data.updateSelectionParameters();
        }
    };

    $scope.toggleDisplay = function(master) {
        if ($scope.data.view.viewState == 0) {
            master.display = !master.display;
        }
    };

    $scope.deselectAllGlyphs = function(master) {
        angular.forEach(master.glyphs, function(glyph) {
            glyph.edit = false;
        });
    };

    /***** Dropping to design space *****/

    $scope.sortableOptionsSequences = {
        helper : 'clone',
        handle : '.sequence-name'
    };

    var cursorHelper = false;

    function createCursorHelper(x, y) {
        cursorHelper = true;
        var cursorHelper = "<div id='cursor-helper' style='left:" + (x + 10) + "px; top:" + (y + 10) + "px'></div>";
        $(document.body).append(cursorHelper);
    }

    function destroyCursorHelper() {
        $("#cursor-helper").remove();
        cursorHelper = false;
    }

    function setPositionCursorHelper(x, y) {
        $("#cursor-helper").css({
            "left" : x + 10,
            "top" : y + 10
        });
    }

    function setColorCursorHelper(color, t) {
        $("#cursor-helper").html(t);
        $("#cursor-helper").css("background", color);
    }


    $scope.sortableOptionsMasters = {
        handle : '.list-edit-col',
        helper : 'clone',
        connectWith : '.drop-area, .sequence',
        sort : function(e, ui) {
            // check which master is dropped

            var sequenceIndex = ui.item.parent().parent().index();
            var masterIndex = ui.item.index();
            var master = $scope.data.sequences[sequenceIndex].masters[masterIndex];
            if (IsOverDropArea(ui)) {
                if (!cursorHelper) {
                    createCursorHelper(e.pageX, e.pageY);
                }
                setPositionCursorHelper(e.pageX, e.pageY);
                if (isInDesignspace(master.name)) {
                    setColorCursorHelper("red", "×") ;
                } else {
                    setColorCursorHelper("#4FC400", "+");
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
            // check which master is dropped
            var sequenceIndex = ui.item.parent().parent().index();
            var masterIndex = ui.item.index();
            var master = $scope.data.sequences[sequenceIndex].masters[masterIndex];

            if (IsOverDropArea(ui) && !isInDesignspace(master.name)) {
                // push master to design space when dropped on drop-area
                $scope.addMasterToDesignspace(master);
                $scope.$apply();
            }
            $(".drop-area").removeClass("drag-over");
        }
    };

    $scope.addMasterToDesignspace = function(master) {
        var designspace = $scope.data.currentDesignspace;
        // activate designspace
        if (designspace.type == "x") {
            designspace.type = "Control";
        }
        // initial slider value
        if (designspace.axes.length == 0) {
            var thisValue = 50;
        } else if (designspace.axes.length == 1) {
            var thisValue = 100 - designspace.axes[0].value;
        } else {
            var thisValue = 0;
        }
        designspace.axes.push({
            masterName : master.name,
            masterdisplayName : master.displayName,
            value : thisValue
        });
        if (designspace.axes.length == 1) {
            $scope.data.addInstance();
        } else {
            $scope.data.addAxisToInstance(master, thisValue);
        }
        $scope.data.checkIfIsLargest();
    };

    function isInDesignspace(masterName) {
        var isInDesignspace = false;
        for (var i = 0; i < $scope.data.currentDesignspace.axes.length; i++) {
            if ($scope.data.currentDesignspace.axes[i].masterName == masterName) {
                isInDesignspace = true;
                break;
            }
        }
        return isInDesignspace;
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
