app.controller('instancesController', function($scope, $http, sharedScope) {
    $scope.data = sharedScope.data;
    
    
    
    
/***** cps *****/

    $scope.createMultiMasterCPS = function (masterSet) {
        var end = masterSet.length + 1;
        var cpsString = "@import 'centreline-skeleton-to-symmetric-outline.cps'";
        cpsString += "point > * { indexGlyph: parent:parent:parent:index; indexPenstroke: parent:parent:index; indexPoint: parent:index;";
        for (var i = 1; i < end; i++) {
            cpsString += "base" + i + ": baseMaster" + i + ":children[indexGlyph]:children[indexPenstroke]:children[indexPoint]:children[index];";
        }
        cpsString += "interpolationUnit: 1/(";
        for (var i = 1; i < end; i++) {
            if (i != 1) {
                cpsString += " + ";
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
            cpsString +=  "(normalizeAngle base" + i + ":inDir) * _p" + i;
        }
        cpsString += ";} point:i(-1) > right, point:i(-1) > left { outDir: ";
        for (var i = 1; i < end; i++) {
            if (i != 1) {
                cpsString += " + ";
            }
            cpsString +=  "(normalizeAngle base" + i + ":outDir) * _p" + i;
        }
        cpsString += ";}";
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
        if(!instance.edit) {
            instance.display = !instance.display;
        }
    };
    
    
    
    
/***** controlling instances *****/
    
    
    function findInstanceId () {
        var max = 0;
        angular.forEach($scope.data.families, function(family) {
            angular.forEach(family.instances, function(instance) {
                if (instance.id > max) {
                    max = instance.id;
                }
            });
        });
        max++;
        return max;
    }

    $scope.uniqueInstanceId = 0;

    $scope.data.addInstance = function() {
        $scope.data.deselectAllEdit();
        if ($scope.data.canAddInstance()) {
            // link instance to design space and use its masters and values
            var designSpace = $scope.data.currentDesignSpace;
            var masterSet = jQuery.extend(true, [], designSpace.masters);
            var axesSet = jQuery.extend(true, [], designSpace.axes);
            var newValue = 1 / masterSet.length;
            angular.forEach(masterSet, function(thisMaster) {
                   thisMaster.value = newValue;
            });
            angular.forEach(axesSet, function(thisAxis) {
                   thisAxis.value = 50;
            });
            // add the instance
            $scope.uniqueInstanceId++;
            var instanceName = "instance" + $scope.uniqueInstanceId;
            var cpsFile = instanceName + ".cps";
            var cpsString = '@import "lib/metapolate-2.cps"; * { baseMaster1: S"master#' + masterSet[0].masterName + '"; baseMaster2: S"master#' + masterSet[1].masterName + '"; proportion1: .5; proportion2: .5;}';
            $scope.data.families[0].instances.push({
                id : $scope.uniqueInstanceId,
                edit : true,
                display : true,
                ag : "Ag",
                name : instanceName,
                designSpace : designSpace.id,
                fontFamily : "Roboto",
                fontWeight : 700,
                masters: masterSet,
                axes: axesSet,
                cpsFile: cpsFile
            });
            $scope.data.currentInstance = $scope.data.families[0].instances[($scope.data.families[0].instances.length - 1)];
            $scope.data.localmenu.instances = false;
            // create a master inside the engine and attach a cps file
            $scope.data.stateful.project.ruleController.write(false, cpsFile, cpsString); 
            $scope.data.stateful.project.createMaster(instanceName, cpsFile, "skeleton.base");
            $scope.data.stateful.project.open(instanceName);
            $scope.data.metapolate();
        }
    };
    
    $scope.setParameter;
    
    $scope.data.metapolate = function () {
        console.log("!");
        var instance = $scope.data.currentInstance;
        //var parameterCollection = $scope.data.stateful.controller.getMasterCPS(false, instance.name);
        var parameterCollection =  $scope.data.stateful.project.ruleController.getRule(false, instance.cpsFile);
        var l = parameterCollection.length;
        var cpsRule = parameterCollection.getItem(l - 1);
        var parameterDict = cpsRule.parameters;
        var setParameter = $scope.data.stateless.cpsAPITools.setParameter;
        for (var i = 0; i < instance.masters.length; i++) {
            var masterName = instance.masters[i].masterName;
            var selector = 'S"master#' + masterName + '"';
            setParameter(parameterDict, "baseMaster" + (i + 1), selector);  
            setParameter(parameterDict, "proportion" + (i + 1), instance.masters[i].value);   
        }
    };
    
    $scope.data.duplicateInstance = function (instance, space) {
        if (instance) {
            $scope.data.deselectAllEdit();
            var duplicate = jQuery.extend(true, {}, instance);
            duplicate.name = $scope.duplicateName(duplicate.name);
            duplicate.edit = true;
            duplicate.id = findInstanceId();
            if (space) {
                duplicate.designSpace = space;
            }
            $scope.data.families[0].instances.push(duplicate);
            $scope.data.currentInstance = $scope.data.families[0].instances[($scope.data.families[0].instances.length - 1)];
        }
    };
    
    
    
    $scope.duplicateName = function(inputname){
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
    
    $scope.deleteInstance = function () {
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
    $scope.data.deleteInstanceDirect = function (designSpace) {
        // reverse order, otherwise splice gets confused
        for (i = $scope.data.families.length - 1; i >= 0; i--) {
            for (j = $scope.data.families[i].instances.length - 1; j >= 0; j--) {
                var instance = $scope.data.families[i].instances[j];
                if (instance.designSpace == designSpace) {
                    $scope.data.families[i].instances.splice($scope.data.families[i].instances.indexOf(instance), 1);
                }            
             }            
        }
    };
    
    function deleteInstanceConfirmed () {
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
        setCurrentDesignSpace(thisInstance.designSpace);
    };
    
    function setCurrentDesignSpace (id) {
        for (var i = 0; i < $scope.data.designSpaces.length; i++) {
            if ($scope.data.designSpaces[i].id == id) {
                $scope.data.currentDesignSpace = $scope.data.designSpaces[i];
                break;
            }
        }  
    }
    
    /*
    function valueToAxes(instance) {
        var designspace = $scope.data.currentDesignSpace;
        designspace.axes = [];
        var mastersNewOrder = [];
        var mastersCurrentOrder = instance.masters;
        // set masters of instance in order of designspace setup
        for (var i = 0; i < designspace.masters.length; i++) {
            var thisMaster = {
                masterId: designspace.masters[i].masterId,
                value: 0
            };
            for (var j = 0; j < mastersCurrentOrder.length; j++) {
                if (designspace.masters[i].masterId == mastersCurrentOrder[j].masterId) {
                    thisMaster.value = mastersCurrentOrder[j].value;
                }  
            }
            mastersNewOrder.push(thisMaster);
        }
        // translate ratio to slider value
        // the little correction to avoid /0 i not yet included here
        for (var i = 1; i < mastersNewOrder.length; i++) {
            var thisRatio = mastersNewOrder[i].value / mastersNewOrder[0].value;
            
            var thisValue = roundup(100 - (100.5 - 0.5 * thisRatio) / (1 + thisRatio));
            designspace.axes.push({
                value : thisValue
            });
        }
    }
    */
    
    $scope.data.addAxisToInstance = function(masterId) {
        angular.forEach($scope.data.families, function(family) {
            angular.forEach(family.instances, function(instance) {
                if (instance.designSpace == $scope.data.currentDesignSpace.id) {
                    var thisValue = 0;
                    if (instance == $scope.data.currentInstance) {
                        thisValue = 50;
                    }
                    instance.axes.push({
                        value : thisValue
                    });
                    var metapValue = 0;
                    instance.masters.push({
                        masterId : masterId,
                        value : metapValue
                    });
                }
            });
        });
    };
    
    function roundup(a) {
        var b = Math.round(a * 10) / 10;
        return b;
    }


    
    
/***** bottom buttons *****/


    $scope.data.canAddInstance = function() {
        if ($scope.data.currentDesignSpace) {
            var designSpace = $scope.data.currentDesignSpace;
            if ((designSpace && designSpace.type == "Control" && designSpace.axes.length > 0) || (designSpace.type == "Explore" && designSpace.masters.length > 0) ) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    };
    
    
    
    
/***** sortable *****/
    
    
    $scope.sortableOptionsMasters = {
        handle : '.list-edit-col',
        helper : 'clone',
    };

});
