app.controller('instancesController', function($scope, $http, sharedScope) {
    $scope.data = sharedScope.data;

    $scope.data.colorCoding = ["#F01616", "#D75699", "#A258F5", "#4C51ED", "#3490FF", "#8FE7FD", "#73C4A5", "#A5CF1B", "#FADD04", "#DE7B25"];

    $scope.addColor = function(id) {
        if (id > ($scope.data.colorCoding.length - 1)) {
            $scope.addNewColor();
        }
    };

    $scope.addNewColor = function() {
        var a = $scope.data.colorCoding.length % 3;
        var b = ($scope.data.colorCoding.length + 1) % 3;
        var c = ($scope.data.colorCoding.length + 2) % 3;
        var r = getRandom(a);
        var g = getRandom(b);
        var b = getRandom(c);
        var color = "rgb(" + r + "," + g + "," + b + ")";
        $scope.data.colorCoding.push(color);
    };

    $scope.getDiamondColor = function(instance) {
        if (instance == $scope.data.currentInstance) {
            return $scope.data.colorCoding[instance.id];
        } else {
            return "none";
        }
    };

    function getRandom(x) {
        return Math.round(85 * Math.random()) + x * 85;
    }


    $scope.data.metapolate = function() {
        if ($scope.data.pill != "blue") {
            var instance = $scope.data.currentInstance;
            //var parameterCollection = $scope.data.stateful.controller.getMasterCPS(false, instance.name);
            var parameterCollection = $scope.data.stateful.project.ruleController.getRule(false, instance.cpsFile);
            var l = parameterCollection.length;
            var cpsRule = parameterCollection.getItem(l - 1);
            var parameterDict = cpsRule.parameters;
            var setParameter = $scope.data.stateless.cpsAPITools.setParameter;
            for (var i = 0; i < instance.axes.length; i++) {
                setParameter(parameterDict, "proportion" + i, instance.axes[i].metapValue);
                console.log(instance.axes[i].masterdisplayName + ": " + instance.axes[i].metapValue);
            }
        }
    };

    $scope.data.countInstancesOnDesignspace = function(designspaceId) {
        n = 0;
        angular.forEach($scope.data.families, function(family) {
            angular.forEach(family.instances, function(instance) {
                if (instance.designspace == designspaceId) {
                    n++;
                }
            });
        });
        return n;
    };

    $scope.data.removeInstanceAfterRemovingDesignspace = function(designspaceId) {
        angular.forEach($scope.data.families, function(family) {
            var notDeleted = [];
            angular.forEach(family.instances, function(instance) {
                if (instance.designspace != designspaceId) {
                    notDeleted.push(instance);
                }
            });
            family.instances = notDeleted;
        });
    };

    $scope.data.countInstancesWithMaster = function(masterName) {
        n = 0;
        angular.forEach($scope.data.families, function(family) {
            angular.forEach(family.instances, function(instance) {
                var hasMaster = false;
                angular.forEach(instance.axes, function(axis) {
                    if (axis.masterName == masterName) {
                        hasMaster = true;
                    }
                });
                if (hasMaster) {
                    n++;
                }
            });
        });
        return n;
    };

    $scope.data.getAxisIndex = function(axes, masterName) {
        var i;
        angular.forEach(axes, function(axis, index) {
            if (axis.masterName == masterName) {
                i = index;
            }
        });
        return i;
    };

    $scope.data.getMetapolationRatios = function(instance) {
        var axes = instance.axes;
        var n = axes.length;
        var cake = 0;
        for (var i = 0; i < n; i++) {
            cake += parseFloat(axes[i].value);
        }
        for (var i = 0; i < n; i++) {
            var piece = parseFloat(axes[i].value);
            instance.axes[i].metapValue = piece / cake;
        }
    };

    /***** hover instances *****/
    $scope.mouseoverInstance = function(instance) {
        // Dim slider diamonds.
        if (instance == $scope.data.currentInstance) {
            $(".blue-diamond").css({opacity: 0.1});
        } else {
            $("[id^='diamond']").css({ opacity: 0.1 });
            var current = $(".instance" + instance.id);
            $(".blue-diamond").not(current).each(function() {
                $(this).css({ opacity: 0.1 });
            });
        }
        // Dim specimen text.
        if (instance.display || instance == $scope.data.currentInstance) {
            var id = instance.id;
            $("specimen2 #specimen-content ul li").each(function() {
                var thisId = $(this).find("glyph").attr("master");
                if (thisId != id) {
                    $(this).addClass("dimmed");
                }
            });
        }
    };

    $scope.mouseleaveInstance = function() {
        // Restore slider diamonds.
        $("[id^='diamond']").css("opacity", "");
        $(".blue-diamond").css("opacity", "");
        // Restore specimen tect.
        $("specimen2 #specimen-content ul li").removeClass("dimmed");
    };

    /***** controlling instances *****/

    $scope.uniqueInstanceId = 0;

    $scope.data.addInstance = function() {
        if ($scope.data.canAddInstance()) {
            // link instance to design space and use its masters and values
            var designspace = $scope.data.currentDesignspace;
            var axesSet = jQuery.extend(true, [], designspace.axes);
            var newMetapValue = 1 / axesSet.length;
            angular.forEach(axesSet, function(axis) {
                axis.value = 50;
                axis.metapValue = newMetapValue;
            });
            var instanceName = "instance" + $scope.uniqueInstanceId;
            var cpsFile = instanceName + ".cps";
            var thisInstance = {
                id : $scope.uniqueInstanceId,
                display : false,
                ag : "Ag",
                name : instanceName,
                displayName : instanceName,
                designspace : designspace.id,
                fontFamily : "Roboto",
                fontWeight : 700,
                axes : axesSet,
                cpsFile : cpsFile,
                exportFont : true,
                openTypeFeatures : true
            };
            $scope.data.registerInstance(thisInstance);
        }
    };

    $scope.data.duplicateInstance = function(instance, space) {
        if (instance) {
            var duplicate = jQuery.extend(true, {}, instance);
            var newName = $scope.duplicateName(duplicate.name);
            duplicate.name = newName;
            duplicate.displayName = newName;
            duplicate.id = $scope.uniqueInstanceId;
            if (space) {
                // duplicate via duplicate design space
                duplicate.designspace = space;
            }
            $scope.data.registerInstance(duplicate);
        }
    };

    $scope.data.registerInstance = function(instance) {
        $scope.data.families[0].instances.push(instance);
        $scope.data.currentInstance = $scope.data.families[0].instances[($scope.data.families[0].instances.length - 1)];
        // create a master inside the engine and attach a cps file
        if ($scope.data.pill != "blue") {
            var cpsString = $scope.createMultiMasterCPS(instance.axes);
            $scope.data.stateful.project.ruleController.write(false, instance.cpsFile, cpsString);
            $scope.data.stateful.project.createMaster(instance.name, instance.cpsFile, "skeleton.base");
            $scope.data.stateful.project.open(instance.name);
        }
        $scope.data.localmenu.instances = false;
        $scope.uniqueInstanceId++;
        $scope.addColor();
    };

    $scope.duplicateName = function(inputname) {
        var serialNr = 1;
        var cleanName = inputname;
        var endsWithNr = inputname.match(/\d+$/);
        if (endsWithNr) {
            var nrString = endsWithNr[0];
            cleanName = inputname.substr(0, (inputname.length - nrString.length));
            serialNr = parseInt(nrString);
        }
        angular.forEach($scope.data.families, function(family) {
            angular.forEach(family.instances, function(instance) {
                var thisName = instance.name;
                endsWithNr = thisName.match(/\d+$/);
                if (endsWithNr) {
                    nrString = endsWithNr[0];
                    var thisCleanName = thisName.substr(0, (thisName.length - nrString.length));
                    if (thisCleanName == cleanName) {
                        var thisNr = parseInt(nrString);
                        if (thisNr > serialNr) {
                            serialNr = thisNr;
                        }
                    }
                }
            });
        });
        serialNr++;
        return cleanName + serialNr;
    };

    $scope.data.deleteInstanceFromDesignspace = function(instance) {
        // this method is called when removing the last master from a designspace
        $scope.data.families[0].instances.splice($scope.data.families[0].instances.indexOf(instance), 1);
    };

    $scope.deleteInstance = function() {
        if ($scope.data.currentInstance) {
            var designspace = $scope.data.currentInstance.designspace;
            var n = 0;
            angular.forEach($scope.data.families, function(family) {
                angular.forEach(family.instances, function(instance) {
                    if (instance.designspace == designspace) {
                        n++;
                    }
                });
            });
            // last instance of the design space
            if (n == 1) {
                var designspaceName = $scope.data.getDesignspaceName(designspace);
                var message = "Delete instance? This also deletes the design space '" + designspaceName + "'.";
                if (confirm(message)) {
                    $scope.data.designspaces.splice($scope.data.designspaces.indexOf($scope.data.currentDesignspace), 1);
                    $scope.data.currentDesignspace = null;
                    deleteInstanceConfirmed();
                }
            } else {
                deleteInstanceConfirmed();
            }
        }
    };

    // delete after deleting design space
    $scope.data.deleteInstanceDirect = function(designspace) {
        // reverse order, otherwise splice gets confused
        for ( i = $scope.data.families.length - 1; i >= 0; i--) {
            for ( j = $scope.data.families[i].instances.length - 1; j >= 0; j--) {
                var instance = $scope.data.families[i].instances[j];
                if (instance.designspace == designspace) {
                    $scope.data.families[i].instances.splice($scope.data.families[i].instances.indexOf(instance), 1);
                }
            }
        }
    };

    function deleteInstanceConfirmed() {
        var index = $scope.getIndexOfInstance($scope.data.currentInstance);
        $scope.data.families[0].instances.splice($scope.data.families[0].instances.indexOf($scope.data.currentInstance), 1);
        $scope.data.localmenu.instances = false;
        // set new current instance
        var n = $scope.data.families[0].instances.length;
        if (n <= index) {
            $scope.data.currentInstance = $scope.data.families[0].instances[n - 1];
        } else {
            $scope.data.currentInstance = $scope.data.families[0].instances[index];
        }
    }


    $scope.getIndexOfInstance = function(thisInstance) {
        var thisIndex;
        angular.forEach($scope.data.families, function(family) {
            angular.forEach(family.instances, function(instance, index) {
                if (instance == thisInstance) {
                    thisIndex = index;
                }
            });
        });
        return thisIndex;
    };

    /***** feedback on design spaces *****/

    $scope.data.currentInstance = null;

    $scope.data.selectCurrentInstanceFromDesignspace = function(designspaceId) {
        var instanceInSpace = null;
        angular.forEach($scope.data.families, function(family) {
            angular.forEach(family.instances, function(instance) {
                if (instance.designspace == designspaceId) {
                    instanceInSpace = instance;
                }
            });
        });
        if (instanceInSpace) {
            $scope.data.currentInstance = instanceInSpace;
        }
    };

    $scope.setCurrentInstance = function(thisInstance) {
        $scope.data.currentInstance = thisInstance;
        $scope.setCurrentDesignSpace(thisInstance.designspace);
    };

    $scope.setCurrentDesignSpace = function(designspaceId) {
        for (var i = 0; i < $scope.data.designspaces.length; i++) {
            if ($scope.data.designspaces[i].id == designspaceId) {
                $scope.data.currentDesignspace = $scope.data.designspaces[i];
                break;
            }
        }
    };

    $scope.data.addAxisToInstance = function(master, value) {
        angular.forEach($scope.data.families, function(family) {
            angular.forEach(family.instances, function(instance) {
                if (instance.designspace == $scope.data.currentDesignspace.id) {
                    // for the current instance the slider value of the new axis is 50, for the others in this designspace it is 0
                    instance.axes.push({
                        metapValue : 0,
                        masterName : master.name,
                        masterdisplayName : master.displayName,
                        value : value
                    });
                    $scope.data.getMetapolationRatios(instance);
                    // empty current cps file and rewrite it with new masters
                    if ($scope.data.pill != "blue") {
                        var cpsString = $scope.createMultiMasterCPS(instance.axes);
                        $scope.data.stateful.project.ruleController.write(false, instance.cpsFile, cpsString);
                    }
                }
            });
        });
    };

    /***** bottom buttons *****/

    $scope.data.canAddInstance = function() {
        if ($scope.data.currentDesignspace) {
            var designspace = $scope.data.currentDesignspace;
            if ((designspace && designspace.type == "Control" && designspace.axes.length > 0) || (designspace.type == "Explore" && designspace.masters.length > 0)) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    };

    /***** selections *****/

    $scope.mouseDown = false;

    $scope.toggleViewSet = function(set, initialDisplay) {
        if (initialDisplay == "true") {
            var newStatus = false;
        } else {
            var newStatus = true;
        }
        angular.forEach($scope.data.families, function(family) {
            angular.forEach(family.instances, function(instance) {
                var hit = false;
                angular.forEach(set, function(selection) {
                    if (selection.parentObject == family.id && selection.childObject == instance.id) {
                        hit = true;
                    }
                });
                if (hit) {
                    instance.display = newStatus;
                }
            });
        });
    };

    $scope.toggleDisplay = function(instance) {
        instance.display = !instance.display;
    };

    /***** sortable *****/

    $scope.sortableOptionsMasters = {
        handle : '.list-edit-col',
        helper : 'clone',
    };

    /***** cps *****/

    $scope.createMultiMasterCPS = function(axesSet) {
        var n = axesSet.length;
        $scope.createCommonCPSfile(n); 
        // import the common file
        var cpsString = '@import "generated/metapolation-' + n + '.cps";';
        // add the metapolation values as last item
        cpsString += '* { ';
        for (var i = 0; i < n; i++) {
            cpsString += 'baseMaster' + i + ': S"master#' + axesSet[i].masterName + '";';
            cpsString += 'proportion' + i + ': ' + axesSet[i].metapValue + ';';
        }
        cpsString += '}';
        return cpsString;
    };
    
    $scope.createCommonCPSfile = function(n) {
        var commonCPSfile = 'generated/metapolation-' + n + '.cps';
        var commonCPSString;
        try {
            $scope.data.stateful.project.ruleController.getRule(false, commonCPSfile);
        } catch(error) {
            if (error.name !== 'IONoEntry') {
                throw error; 
            } else {
                commonCPSString = $scope.data.stateless.cpsGenerators.metapolation(n);
                $scope.data.stateful.project.ruleController.write(false, commonCPSfile, commonCPSString);
            }
        }
    };
});
