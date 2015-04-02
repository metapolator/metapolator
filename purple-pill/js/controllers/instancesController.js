app.controller('instancesController', function($scope, $http, sharedScope) {
    $scope.data = sharedScope.data;

    $scope.data.colorCoding = ["red"];
    
    $scope.addColor = function () {
        var a = $scope.data.colorCoding.length % 3;
        var b = ($scope.data.colorCoding.length + 1) % 3;
        var c = ($scope.data.colorCoding.length + 2) % 3;
        var r = getRandom(a);
        var g = getRandom(b);
        var b = getRandom(c);
        var color = "rgb(" + r + "," + g + "," + b + ")";
        console.log(color);
        $scope.data.colorCoding.push(color);
    };
    
    $scope.getDiamondColor = function (instance) {
        if (instance == $scope.data.currentInstance) {
            return $scope.data.colorCoding[instance.id];
        } else {
            return "none";    
        }
    };
    
    function getRandom (x) {
        return Math.round(85 * Math.random()) + x * 85;
    }

    $scope.data.metapolate = function() {
        if($scope.data.pill != "blue") {
            console.clear();
            var instance = $scope.data.currentInstance;
            //var parameterCollection = $scope.data.stateful.controller.getMasterCPS(false, instance.name);
            var parameterCollection = $scope.data.stateful.project.ruleController.getRule(false, instance.cpsFile);
            var l = parameterCollection.length;
            var cpsRule = parameterCollection.getItem(l - 1);
            var parameterDict = cpsRule.parameters;
            var setParameter = $scope.data.stateless.cpsAPITools.setParameter;
            for (var i = 0; i < instance.axes.length; i++) {
                var masterName = instance.axes[i].masterName;
                var selector = 'S"master#' + masterName + '"';
                //setParameter(parameterDict, "baseMaster" + (i + 1), selector);
                setParameter(parameterDict, "proportion" + (i + 1), instance.axes[i].metapValue);
                console.log(instance.axes[i].metapValue);
            }
        }
    };

    /***** controlling instances *****/

    $scope.uniqueInstanceId = 0;

    $scope.data.addInstance = function() {
        if ($scope.data.canAddInstance()) {
            // link instance to design space and use its masters and values
            var designSpace = $scope.data.currentDesignSpace;
            var axesSet = jQuery.extend(true, [], designSpace.axes);
            var newMetapValue = 100/ axesSet.length;
            angular.forEach(axesSet, function(axis) {
                axis.value = 50;
                axis.metapValue = newMetapValue;
            });            
            var instanceName = "instance" + $scope.uniqueInstanceId;
            var cpsFile = instanceName + ".cps";
            var thisInstance = {
                id : $scope.uniqueInstanceId,
                edit : true,
                display : true,
                ag : "Ag",
                name : instanceName,
                designSpace : designSpace.id,
                fontFamily : "Roboto",
                fontWeight : 700,
                axes : axesSet,
                cpsFile : cpsFile
            };
            $scope.data.registerInstance(thisInstance);
        }
    };

    $scope.data.duplicateInstance = function(instance, space) {
        if (instance) {
            var duplicate = jQuery.extend(true, {}, instance);
            duplicate.name = $scope.duplicateName(duplicate.name);
            duplicate.edit = true;
            duplicate.id = $scope.uniqueInstanceId;
            if (space) {
                // duplicate via duplicate design space
                duplicate.designSpace = space;
            }
            $scope.data.registerInstance(duplicate);
        }
    };
    
    $scope.data.registerInstance = function (instance, cpsString) {
        $scope.data.families[0].instances.push(instance);
        $scope.data.deselectAllEdit();
        $scope.data.currentInstance = $scope.data.families[0].instances[($scope.data.families[0].instances.length - 1)];
        // create a master inside the engine and attach a cps file
        var cpsString = $scope.createMultiMasterCPS(instance.axes);
        if($scope.data.pill != "blue") {
            $scope.data.stateful.project.ruleController.write(false, cpsFile, cpsString);
            $scope.data.stateful.project.createMaster(instance.name, instance.cpsFile, "skeleton.base");
            $scope.data.stateful.project.open(instanceName);
            $scope.data.metapolate();
            $scope.data.localmenu.instances = false;
        } 
        $scope.uniqueInstanceId++;
        $scope.addColor();
    };

    $scope.duplicateName = function(inputname) {
        var serieNr = 1;
        var cleanName = inputname;
        var endsWithNr = inputname.match(/\d+$/);
        if (endsWithNr) {
            var nrString = endsWithNr[0];
            cleanName = inputname.substr(0, (inputname.length - nrString.length));
            serieNr = parseInt(nrString);
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
                        if (thisNr > serieNr) {
                            serieNr = thisNr;
                        }
                    }
                }
            });
        });
        serieNr++;
        return cleanName + serieNr;
    };

    $scope.deleteInstance = function() {
        if ($scope.data.currentInstance) {
            var designSpace = $scope.data.currentInstance.designSpace;
            var n = 0;
            angular.forEach($scope.data.families, function(family) {
                angular.forEach(family.instances, function(instance) {
                    if (instance.designSpace == designSpace) {
                        n++;
                    }
                });
            });
            // last instance of the design space
            if (n == 1) {
                if (confirm("Removing last instance from Design Space. This will remove the Design Space. Sure?")) {
                    $scope.data.designSpaces.splice($scope.data.designSpaces.indexOf($scope.data.currentDesignSpace), 1);
                    $scope.data.currentDesignSpace = null;
                    deleteInstanceConfirmed();
                }
            } else {
                deleteInstanceConfirmed();
            }
        }
    };

    // delete after deleting design space
    $scope.data.deleteInstanceDirect = function(designSpace) {
        // reverse order, otherwise splice gets confused
        for ( i = $scope.data.families.length - 1; i >= 0; i--) {
            for ( j = $scope.data.families[i].instances.length - 1; j >= 0; j--) {
                var instance = $scope.data.families[i].instances[j];
                if (instance.designSpace == designSpace) {
                    $scope.data.families[i].instances.splice($scope.data.families[i].instances.indexOf(instance), 1);
                }
            }
        }
    };

    function deleteInstanceConfirmed() {
        $scope.data.families[0].instances.splice($scope.data.families[0].instances.indexOf($scope.data.currentInstance), 1);
        $scope.data.localmenu.instances = false;
        // set top instance as current
        if ($scope.data.families[0].instances.length) {
            $scope.data.currentInstance = $scope.data.families[0].instances[0];
            $scope.data.currentInstance.edit = true;
        } else {
            $scope.data.currentInstance = null;
        }
    }

    /***** feedback on design spaces *****/

    $scope.data.currentInstance = null;

    $scope.setCurrentInstance = function(thisInstance) {
        $scope.data.currentInstance = thisInstance;
        $scope.setCurrentDesignSpace(thisInstance.designSpace);
    };

    $scope.setCurrentDesignSpace = function(designSpaceId) {
        for (var i = 0; i < $scope.data.designSpaces.length; i++) {
            if ($scope.data.designSpaces[i].id == designSpaceId) {
                $scope.data.currentDesignSpace = $scope.data.designSpaces[i];
                break;
            }
        }
    };

    $scope.data.addAxisToInstance = function(master, value) {
        angular.forEach($scope.data.families, function(family) {
            angular.forEach(family.instances, function(instance) {
                if (instance.designSpace == $scope.data.currentDesignSpace.id) {
                    // for the current instance the slider value of the new axis is 50, for the others in this designspace it is 0 
                    var thisValue = 0;
                    if (instance == $scope.data.currentInstance) {
                        thisValue = value;
                    }
                    instance.axes.push({
                        metapValue : 0,
                        masterName : master.name,
                        masterdisplayName : master.displayName,
                        value : thisValue
                    });
                    // empty current cps file and rewrite it with new masters
                    if ($scope.data.pill != "blue") {
                        var cpsString = $scope.createMultiMasterCPS(instance.axes);
                        $scope.data.stateful.project.ruleController.write(false, instance.cpsFile, "");
                        $scope.data.stateful.project.ruleController.write(false, instance.cpsFile, cpsString);
                    }
                }
            });
        });
    };

    /***** bottom buttons *****/

    $scope.data.canAddInstance = function() {
        if ($scope.data.currentDesignSpace) {
            var designSpace = $scope.data.currentDesignSpace;
            if ((designSpace && designSpace.type == "Control" && designSpace.axes.length > 0) || (designSpace.type == "Explore" && designSpace.masters.length > 0)) {
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

    $scope.toggleEdit = function(listItem) {
        angular.forEach($scope.data.families, function(family) {
            angular.forEach(family.instances, function(instance) {
                if (listItem.parentObject == family.id && listItem.childObject == instance.id) {
                    instance.edit = !instance.edit;
                    instance.display = instance.edit;
                }
            });
        });
    };

    $scope.selectEdit = function(set) {
        angular.forEach($scope.data.families, function(family) {
            angular.forEach(family.instances, function(instance) {
                var hit = false;
                angular.forEach(set, function(selection) {
                    if (selection.parentObject == family.id && selection.childObject == instance.id) {
                        hit = true;
                    }
                });
                if (hit) {
                    instance.edit = true;
                    instance.display = true;
                } else {
                    instance.edit = false;
                }
            });
        });
    };

    $scope.data.deselectAllEdit = function() {
        angular.forEach($scope.data.families, function(family) {
            angular.forEach(family.instances, function(instance) {
                instance.edit = false;
            });
        });
    };

    $scope.toggleDisplay = function(instance) {
        if (!instance.edit) {
            instance.display = !instance.display;
        }
    };

    /***** sortable *****/

    $scope.sortableOptionsMasters = {
        handle : '.list-edit-col',
        helper : 'clone',
    };
    
    /***** cps *****/

    $scope.createMultiMasterCPS = function(axesSet) {
        var end = axesSet.length + 1;
        var cpsString = "@import 'centreline-skeleton-to-symmetric-outline.cps';";
        cpsString += "point > * { indexGlyph: parent:parent:parent:index; indexPenstroke: parent:parent:index; indexPoint: parent:index;";
        for (var i = 1; i < end; i++) {
            cpsString += "base" + i + ": baseMaster" + i + ":children[indexGlyph]:children[indexPenstroke]:children[indexPoint]:children[index];";
        }
        cpsString += "interpolationUnit: 1/(";
        for (var i = 1; i < end; i++) {
            if (i != 1) {
                cpsString += " + ";
            }
            cpsString += "proportion" + i;
        }
        cpsString += ");";
        for (var i = 1; i < end; i++) {
            cpsString += "_p" + i + ": proportion" + i + "*interpolationUnit;";
        }
        cpsString += "} point > * { inLength: ";
        for (var i = 1; i < end; i++) {
            cpsString += "_p" + i + ": proportion" + i + "*interpolationUnit;";
        }
        cpsString += "} point > * { inLength: ";
        for (var i = 1; i < end; i++) {
            if (i != 1) {
                cpsString += " + ";
            }
            cpsString += "base" + i + ":inLength * _p" + i;
        }
        cpsString += "; outLength: ";
        for (var i = 1; i < end; i++) {
            if (i != 1) {
                cpsString += " + ";
            }
            cpsString += "base" + i + ":outLength * _p" + i;
        }
        cpsString += "; inTension: ";
        for (var i = 1; i < end; i++) {
            if (i != 1) {
                cpsString += " + ";
            }
            cpsString += "(min 10000 base" + i + ":inTension) * _p" + i;
        }
        cpsString += "; outTension: ";
        for (var i = 1; i < end; i++) {
            if (i != 1) {
                cpsString += " + ";
            }
            cpsString += "(min 10000 base" + i + ":outTension) * _p" + i;
        }
        cpsString += "; inDirIntrinsic: ";
        for (var i = 1; i < end; i++) {
            if (i != 1) {
                cpsString += " + ";
            }
            cpsString += "(normalizeAngle base" + i + ":inDirIntrinsic) * _p" + i;
        }
        cpsString += "; outDirIntrinsic: ";
        for (var i = 1; i < end; i++) {
            if (i != 1) {
                cpsString += " + ";
            }
            cpsString += "(normalizeAngle base" + i + ":outDirIntrinsic) * _p" + i;
        }
        cpsString += ";} point > left, point > right { onDir: ";
        for (var i = 1; i < end; i++) {
            if (i != 1) {
                cpsString += " + ";
            }
            cpsString += "(normalizeAngle base" + i + ":onDir) * _p" + i;
        }
        cpsString += "; onLength: ";
        for (var i = 1; i < end; i++) {
            if (i != 1) {
                cpsString += " + ";
            }
            cpsString += "base" + i + ":onLength * _p" + i;
        }
        cpsString += ";} point > center { on: ";
        for (var i = 1; i < end; i++) {
            if (i != 1) {
                cpsString += " + ";
            }
            cpsString += "base" + i + ":on * _p" + i;
        }
        cpsString += "; in: ";
        for (var i = 1; i < end; i++) {
            if (i != 1) {
                cpsString += " + ";
            }
            cpsString += "base" + i + ":in * _p" + i;
        }
        cpsString += "; out: ";
        for (var i = 1; i < end; i++) {
            if (i != 1) {
                cpsString += " + ";
            }
            cpsString += "base" + i + ":out * _p" + i;
        }
        cpsString += ";} point:i(0) > left, point:i(0) > right { inDir: ";
        for (var i = 1; i < end; i++) {
            if (i != 1) {
                cpsString += " + ";
            }
            cpsString += "(normalizeAngle base" + i + ":inDir) * _p" + i;
        }
        cpsString += ";} point:i(-1) > right, point:i(-1) > left { outDir: ";
        for (var i = 1; i < end; i++) {
            if (i != 1) {
                cpsString += " + ";
            }
            cpsString += "(normalizeAngle base" + i + ":outDir) * _p" + i;
        }
        cpsString += ";}";

        // add the metapolation values as last item
        cpsString += "* { ";
        for (var i = 1; i < end; i++) {
            cpsString += 'baseMaster' + i + ': S"master#' + axesSet[i - 1].masterName + '";';
            cpsString += "proportion" + i + ": " + axesSet[i - 1].metapValue + ";";
        }
        cpsString += "}";
        return cpsString;
    };

});
