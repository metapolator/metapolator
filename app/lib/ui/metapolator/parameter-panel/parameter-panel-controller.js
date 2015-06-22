define([], function() {
    "use strict";
    function ParameterPanelController($scope) {
        this.$scope = $scope;
        this.$scope.name = 'parameterPanel';

        $scope.levels = $scope.model.allLevels;
    
        $scope.addLevels = function() {
            for (var i = $scope.levels.length - 1; i >= 0; i--) {
                var level = $scope.levels[i];
                $scope.model.addSelectionLevel(level);
            }
        };
        $scope.addLevels();
      
        // CPS functions
    
        /*
        $scope.updateCPSfactor = function(element, parameterName) {
            var multiply = [], cpsFactor = 1, master;
            var thisLevelIndex = $scope.getLevelIndex(element.level);
            var theParameter = $scope.getParameterByName(parameterName);
            var targetLevel = theParameter.effectiveLevel;
            // if we are editing parameter values at the level where the parameter is effective
            // then check for all inhereted parameters ('+', '-', 'min', 'max', '=')
            // else only use local 'x' and '÷'
            if (thisLevelIndex == targetLevel) {
                // to find the local cpsFactor
                // we need to divide the effectiveValue by the initial value and by all parent cpsFactors
                // all the effiveValues are updated at this time by $scope.updateEffectiveValue()
                var effeciveValue, initialValue;
                var parentCPSfactor = $scope.findParentCPSfactor(element, parameterName);
                angular.forEach(element.parameters, function(parameter) {
                    if (parameter.name == parameterName) {
                        effeciveValue = parameter.effective;
                        initialValue = parameter.initial;
                        cpsFactor = effeciveValue / (initialValue * parentCPSfactor);
                        parameter.cpsFactor = cpsFactor;
                    }
                });
                master = $scope.findMasterByElement(element);
                // check if this element has its own rule already
                if (!element.ruleIndex) {
                    $scope.addRullAPI(master, element);
                }
                $scope.setParameterAPI(master, element.ruleIndex, theParameter.cpsKey, cpsFactor);
    
            } else {
                // we are at a higher level then target level. Eg: at masterlevel when editing width (targetlevel for width is glyph)
                // in this level only the local 'x' and '÷' matter
                // futurewise we could also check if we are at a deeper level than target. This can't have effect, so we should give a warning
    
                angular.forEach(element.parameters, function(parameter) {
                    if (parameter.name == parameterName) {
                        angular.forEach(parameter.operators, function(operator) {
                            if (operator.name == "x") {
                                multiply.push(parseFloat(operator.value));
                            } else if (operator.name == "÷") {
                                multiply.push(parseFloat(1 / operator.value));
                            }
                        });
                        angular.forEach(multiply, function(mtply) {
                            cpsFactor *= mtply;
                        });
                        parameter.cpsFactor = cpsFactor;
                        if (element.level == "master") {
                            master = element;
                        } else {
                            master = $scope.findMasterByElement(element);
                        }
                        // check if this element has its own rule already
                        if (!element.ruleIndex) {
                            $scope.addRullAPI(master, element);
                        }
                        $scope.setParameterAPI(master, element.ruleIndex, theParameter.cpsKey, cpsFactor);
                    }
                });
            }
        };
    
        $scope.findParentCPSfactor = function(element, parameterName) {
            var ancestorCPSfactor = 1;
            while (element.level != "master") {
                element = $scope.findParentElement(element);
                angular.forEach(element.parameters, function(parameter) {
                    if (parameter.name == parameterName && parameter.cpsFactor) {
                        ancestorCPSfactor *= parameter.cpsFactor;
                    }
                });
    
            }
            return ancestorCPSfactor;
        };
        
        // this functions checks if this glyph needs to add rules (on glyph, stroke or point level)
        // because it wasn't rendered before by the parameters-specimen, but now a metapolation master is using this glyph
        $scope.updateCPSforGlyph = function(glyph) {
            var measured = false;
            var elements = [glyph.parent];
            var level = 0;
            var inheritance = {};
            var tempElements = [];
            // go down the element tree from master to point
            while (level < 4) {
                angular.forEach(elements, function(element) {
                    angular.forEach(element.parameters, function(parameter) {
                        var thisParameterLevel = $scope.getParameterByName(parameter.name).effectiveLevel;
                        angular.forEach(parameter.operators, function(operator) {
                            var thisOperator = $scope.getOperatorByName(operator.name);
                            // check if the used operator is a `+` or etc. If so, it causes inheritance
                            if (!thisOperator.effectiveLocal) {
                                inheritance[parameter.name] = true;
                            }
                        });
                        // if the parameter has inheritance and we are at the effective level of the parameter, then update the elements cps
                        if (inheritance[parameter.name] && thisParameterLevel == level) {
                            if (!measured) {
                                // set initial values
                                $scope.data.measureInitialForGlyph(glyph);
                                glyph.rendered = true;
                            }
                            // update effective
                            parameter.effective = $scope.updateEffectiveValue(element, parameter.name);
                            $scope.updateCPSfactor(element, parameter.name);
                        }
                    });
                    if (level == 0) {
                        // when we go down the tree we only want to take the glyph we are looking at
                        tempElements.push(glyph);
                    } else {
                        angular.forEach(element.children, function(child) {
                            tempElements.push(child);
                        });
                    }
                });
                elements = tempElements;
                tempElements = [];
                level++;
            }
        };
        */
    
        // API functions
        
        /*
    
        $scope.addRullAPI = function(master, element) {
            if ($scope.data.pill != "blue") {
                var parameterCollection = $scope.data.stateful.project.ruleController.getRule(false, master.cpsFile);
                var l = parameterCollection.length;
                var selectorListString = $scope.constructSelectorString(element);
                var ruleIndex = $scope.data.stateless.cpsAPITools.addNewRule(parameterCollection, l, selectorListString);
                element.ruleIndex = ruleIndex;
            }
        };
    
        $scope.constructSelectorString = function(element) {
            // todo: reconstruct to remove the hardcoded ifs
            var level = element.level, string;
            if (level == "master") {
                string = level + "#" + element.name;
            } else if (level == "glyph") {
                string = level + "#" + element.name;
            } else if (level == "penstroke") {
                glyph = $scope.findParentElement(element);
                string = glyph.level + "#" + glyph.name + " > " + element.name;
            } else if (level == "point") {
                penstroke = $scope.findParentElement(element);
                glyph = $scope.findParentElement(penstroke);
                string = glyph.level + "#" + glyph.name + " > " + penstroke.name + " > " + element.name + " > right";
            }
            return string;
        };
    
        $scope.setParameterAPI = function(master, ruleIndex, cpsKey, value) {
            if ($scope.data.pill != "blue") {
                var parameterCollection = $scope.data.stateful.project.ruleController.getRule(false, master.cpsFile);
                var cpsRule = parameterCollection.getItem(ruleIndex);
                var parameterDict = cpsRule.parameters;
                var setParameter = $scope.data.stateless.cpsAPITools.setParameter;
                setParameter(parameterDict, cpsKey, value);
                console.log(parameterCollection.toString());
            }
        };
        
        */
    }

    ParameterPanelController.$inject = ['$scope'];
    var _p = ParameterPanelController.prototype;

    return ParameterPanelController;
}); 