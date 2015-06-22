define([
    'require/text!./control.tpl',
    'jquery'
], function(
    template
) {
    "use strict";
    function controlDirective() {
        return {
            restrict: 'E',
            controller: 'ControlController',
            scope : {
                model : '=mtkModel'
            },
            replace: false,
            template: template,
            link : function(scope, element, attrs, ctrl) {
                $(window).resize(function() {
                    initialBuildGraphics();
                    redrawFunction();
                });
                var dragActive = false;
                var designSpace = null;
                var thisInstance = null;
                var inactiveInstances = [];
                var svg = d3.select(element[0]).append('svg');
                var layerSingle = svg.append('g').attr('class', 'single-layer');
                var inactiveLayer = svg.append('g').attr('class', 'inactive-axes');
                var activeLayer = svg.append('g').attr('class', 'active-axes');
                
                var singleContainer;
    
                var graphics = {
                    elementWidth : null,
                    axisWidth : null,
                    paddingLeft : 50, 
                    paddingTop : 30, 
                    paddingLabel : 25, 
                    axisDistance : 50, 
                    axisTab : 10, 
                    axisTabLeft : 60, 
                    indentRight : 20, 
                    indentLeft : 40, 
                    diamondsize : 7, 
                    diamondPadding : 12, 
                    paddingRemoveButton : 6,
                    diamondShape : "10,2 4,2 2,6 7,15 12,6",
                    axesString : null,
                    reverseAxesString : null
                };
                
                initialBuildGraphics();
                
                // todo, when changing design space, automatically the current instance is changed as well
                // this causes 2 triggers for redraw, where only the designspace redraw function should be fired
                
                scope.$watch('instancePanel.currentInstanceTrigger', function() {
                    return softRedraw();
                });
                
                scope.$watch('designSpacePanel.currentDesignSpaceTrigger', function() {
                    return redrawFunction();
                });
                
                scope.$watch('designSpacePanel.nrOfAxesTrigger', function() {
                    // for now using a full redraw. We can make this more specific later on
                    return redrawFunction();
                });
                            
                function redrawFunction() {
                    window.logCall("start svg");
                    removeAll();
                    buildData();
                    if (thisInstance) {
                        drawAll();
                        window.logCall("end svg");
                    }  
                    if (inactiveInstances.length > 0) {
                        drawInactiveAxes();
                    }
                }
                
                function softRedraw() {
                    window.logCall("start softRedraw");
                    inactiveLayer.selectAll('*').remove();
                    buildData();
                    if (thisInstance) {
                        reAdjustThisInstance();
                    }
                    if (inactiveInstances.length > 0) {
                        drawInactiveAxes();
                    }
                    window.logCall("end softRedraw");
                }
                
                function buildData() {
                    designSpace = scope.model;
                    thisInstance = null;
                    inactiveInstances = [];
                    for (var i = scope.instancePanel.sequences.length - 1; i >= 0; i--) {
                        var sequence = scope.instancePanel.sequences[i];
                        for (var j = 0, jl = sequence.children.length; j < jl; j++) {
                            var instance = sequence.children[j];
                            if (instance.designSpace == designSpace) {
                                if (instance == scope.instancePanel.currentInstance) {
                                    thisInstance = instance;
                                } else {
                                    for (var k = 0, kl = instance.axes.length; k < kl; k++) {
                                        if (k == designSpace.slack) {
                                            var thisSlack = true;
                                        } else {
                                            var thisSlack = false;
                                        }
                                        var thisAxis = instance.axes[k];
                                        if (!inactiveInstances[k]) {
                                            inactiveInstances[k] = [];
                                        }     
                                        var thisInactiveInstance = {};
                                        thisInactiveInstance.value = thisAxis.axisValue;
                                        thisInactiveInstance.color = instance.color;
                                        thisInactiveInstance.slack = thisSlack;
                                        thisInactiveInstance.name = instance.name;
                                        inactiveInstances[k].push(thisInactiveInstance);
                                    }
                                }
                            }
                        }
                    } 
                }
                
                var axisContainer = null;
                
                function drawAll() {
                    if (thisInstance.axes.length == 1) {
                        drawSingleExtras();
                    }  
                    axisContainer = drawContainers();
                    drawBackLine(axisContainer);
                    drawFrontLine(axisContainer, false);
                    drawHandle(axisContainer, false);
                    drawDiamond(axisContainer, false);
                    drawLabel(axisContainer);
                }
                

                
                function reAdjustThisInstance() {
                    for (var i = 0, l = thisInstance.axes.length; i < l; i++) {
                        var axis = thisInstance.axes[i];
                        // readjust active axis
                        d3.select("#axis-active" + i).attr('d', function() {
                            if (designSpace.slack == i) {
                                return 'M' + ((100 - axis.axisValue) * (graphics.axisStep) + graphics.indentLeft) + ' 0 L' + (graphics.axisRightPoint) + ' 0';
                            } else {
                                return 'M' + graphics.indentLeft + ' 0  L' + (axis.axisValue * (graphics.axisStep) + graphics.indentLeft) + ' 0';
                            }
                        });
                        // readjust handle
                        d3.select("#slider" + i).attr('cx', function() {
                            if (designSpace.slack == i) {
                                return (100 - axis.axisValue) * (graphics.axisStep) + graphics.indentLeft;
                            } else {
                                return axis.axisValue * (graphics.axisStep) + graphics.indentLeft;
                            }
                        });
                        // readjust diamond
                        d3.select("#diamond" + i).attr('transform', function() {
                            if (designSpace.slack == i) {
                                return "translate(" + ((100 - axis.axisValue) * (graphics.axisStep) + graphics.indentPlusDiamond) + ", -28)";
                            } else {
                                return "translate(" + (axis.axisValue * (graphics.axisStep) + graphics.indentPlusDiamond) + ", -28)";
                            }
                        });
                        // reassign color
                        d3.select("#diamond" + i + " polygon").attr('fill', thisInstance.color).attr('stroke', thisInstance.color)
                        .attr('class', 'design-space-diamond instance-' + thisInstance.name).style("opacity", 1);
                    }  
                }
                
                /*
                function reAdjustInactiveInstances() {
                    for (var i = 0, l = inactiveInstances.length; i < l; i++) {
                        var axes = inactiveInstances[i];
                        for (var j = 0, k = axes.length; j < k; j++) {
                            var instance = axes[j];
                            // readjust diamond
                            d3.select(".inactive-axis-" + i + " .inactive-diamond-" + j).attr('transform', function(instance, index) {
                                if (instance.slack) {
                                    var x = graphics.paddingLeft - graphics.diamondsize + graphics.axisWidth / 100 * (100 - instance.value);
                                } else {
                                    var x = graphics.paddingLeft - graphics.diamondsize + graphics.axisWidth / 100 * instance.value;
                                }
                                return "translate(" + x + ", 0)";
                            });
                            // reassign color
                            d3.select(".inactive-diamond-" + j + " polygon").attr('stroke', instance.color);
                        }
                    }
                }
                */
  
                // drawing functions
                function drawContainers() {
                    var data = thisInstance.axes;
                    var axisContainer = activeLayer.selectAll('g').data(data).enter().append('g').attr('transform', function(axis, index) {
                        var x = graphics.leftOffset;
                        var y = index * graphics.axisDistance + graphics.paddingTop;
                        return "translate(" + x + "," + y + ")";
                    }).attr('class', function(axis, index) {
                        return 'slider-container-' + index + ' not-dragging';
                    }); 
                    return axisContainer;
                }
                
                function drawBackLine(axisContainer) {
                    axisContainer.append('path').attr('d', function(axis, index) {
                        if (designSpace.slack == index) {
                            return graphics.reverseAxesString;
                        } else {
                            return graphics.axesString;
                        }
                    }).attr('class', 'slider-axis');
                }
                
                function drawFrontLine(axisContainer, remove) {
                    if (remove) {
                        activeLayer.selectAll('.slider-axis-active').remove();
                    }
                    axisContainer.append('path').attr('d', function(axis, index) {
                        if (designSpace.slack == index) {
                            return 'M' + ((100 - axis.axisValue) * (graphics.axisStep) + graphics.indentLeft) + ' 0 L' + (graphics.axisRightPoint) + ' 0';
                        } else {
                            return 'M' + graphics.indentLeft + ' 0  L' + (axis.axisValue * (graphics.axisStep) + graphics.indentLeft) + ' 0';
                        }
                    }).attr('class', 'slider-axis-active').attr('id', function(axis, index) {
                        return "axis-active" + index;
                    });
                }
                
                function drawHandle(axisContainer, remove) {
                    if (remove) {
                        activeLayer.selectAll('.slider-handle').remove();
                    }
                    axisContainer.append('circle').attr('r', 8).attr('cx', function(axis, index) {
                        if (designSpace.slack == index) {
                            return (100 - axis.axisValue) * (graphics.axisStep) + graphics.indentLeft;
                        } else {
                            return axis.axisValue * (graphics.axisStep) + graphics.indentLeft;
                        }
                    }).attr('cy', '0').attr('index', function(axis, index) {
                        return index;
                    }).attr('class', 'slider-handle').attr('id', function(axis, index) {
                        return 'slider' + index;
                    }).call(drag); 
                }
                
                function drawDiamond(axisContainer, remove) {
                    if (remove) {
                        activeLayer.selectAll('.design-space-diamond').remove();
                    }
                    axisContainer.append('g').attr('id', function(axis, index) {
                        return 'diamond' + index;
                    }).attr('transform', function(axis, index) {
                        if (designSpace.slack == index) {
                            return "translate(" + ((100 - axis.axisValue) * (graphics.axisStep) + graphics.indentPlusDiamond) + ", -28)";
                        } else {
                            return "translate(" + (axis.axisValue * (graphics.axisStep) + graphics.indentPlusDiamond) + ", -28)";
                        }
                    }).append('polygon')
                      .attr('points', graphics.diamondShape)
                      .attr('fill', thisInstance.color)
                      .attr('stroke', thisInstance.color)
                      .attr('class', 'design-space-diamond instance-' + thisInstance.name)
                      .attr('stroke-width', 2);
                }
        
                function drawLabel(axisContainer) {
                    var label = axisContainer.append('g').attr('transform', function(axis, index) {
                        if (index == designSpace.slack) {
                            var x = graphics.leftOffset - 10;
                        } else {
                            var x = graphics.rightTextLeftPoint;
                        }
                        var y = graphics.paddingLabel;
                        return "translate(" + x + "," + y + ")";
                    }).attr('class', 'slider-label-container').style('display', function(axis, index) {
                        if (index != designSpace.slack || designSpace.axes.length < 3) {
                            return 'block';
                        } else {
                            return 'none';
                        }
                    });
                    
                    label.append('rect').attr('x', '0').attr('y', '-15').attr('width', '100').attr('height', '20').attr('class', 'slider-hover-square');
                    label.append('text').text(function(axis, index) {
                        return axis.master.displayName;
                    }).attr('id', function(axis, index) {
                        return 'slider-label-' + index;
                    }).attr('x', 4);
                    
                    //remove button
                    var removeButton = label.append('g').attr('transform', function(axis, index) {
                        var x = document.getElementById("slider-label-" + index).getBoundingClientRect().width;
                        x += graphics.paddingRemoveButton + 10;
                        return "translate(" + x + ",0)";
                    }).attr('class', 'remove-master-g');
                    removeButton.append('circle').attr('cx', 3).attr('cy', -2).attr('r', 7).attr('class', 'remove-master-bg');
                    removeButton.append('text').attr('x', 0).attr('y', '2').text("×").
                        attr('class', 'remove-master-text').on("click", function(axis, index) {
                            scope.removeMaster(axis.master, designSpace);
                        });
                }
                
                function drawSingleExtras() {
                    var singleContainer = layerSingle.append('g').attr('transform', function(d, i) {
                        var x = graphics.leftOffset;
                        var y = graphics.axisDistance + graphics.paddingTop;
                        return "translate(" + x + "," + y + ")";
                    }).attr('class', 'slider-container');
                    singleContainer.append('path').attr('d', function(d, i) {
                        return graphics.axesString;
                    }).attr('class', 'slider-axis');
                    singleContainer.append('text').attr('x', graphics.rightTextLeftPoint).attr('y', graphics.paddingLabel).text('Just one more...').attr('class', 'label-right-inactive slider-label');
                }
                
                function drawInactiveAxes() {
                    var data = inactiveInstances;
                    inactiveLayer.selectAll('g').data(data).enter().append('g').attr('transform', function(axis, index) {
                        var y = index * graphics.axisDistance + graphics.paddingTop - 28;
                        return "translate(0, " + y + ")";
                    })
                    .attr('class', function(axis, index) {
                        return 'inactive-axis-' + index;
                    })
                    .selectAll("g").data(function(axis, index) { 
                        return axis; 
                    }).enter().append('g').attr('transform', function(instance, index) {
                        if (instance.slack) {
                            var x = graphics.paddingLeft - graphics.diamondsize + graphics.axisWidth / 100 * (100 - instance.value);
                        } else {
                            var x = graphics.paddingLeft - graphics.diamondsize + graphics.axisWidth / 100 * instance.value;
                        }
                        return "translate(" + x + ", 0)";
                    }).attr('class', function(instance, index){
                        return "inactive-instance-" + index;
                    }).append('polygon')
                      .attr('points', graphics.diamondShape)
                      .attr('class', function(instance,index) {
                          return 'design-space-diamond instance-' + instance.name;
                      }).attr('stroke', function(instance, index) {
                          return instance.color;
                    }).attr('fill', 'none').attr('stroke-width', 2); 
                }
                
                // helper functions
                function initialBuildGraphics() {
                    responsiveGraphics();
                    buildGraphics(); 
                }
                
                function responsiveGraphics() {
                    graphics.elementWidth = $(element).outerWidth();
                    graphics.axisWidth = graphics.elementWidth - 200;
                    // set these values to the scope so .tpl file can use them
                    // to place the input fields, etc.
                    scope.axisWidth = graphics.axisWidth;
                    scope.paddingTop = graphics.paddingTop;
                    scope.axisDistance = graphics.axisDistance;
                    scope.paddingLeft = graphics.paddingLeft;
                }
                
                function buildGraphics() {
                    graphics.leftOffset = graphics.paddingLeft - graphics.indentLeft;
                    graphics.axisRightPoint = graphics.indentLeft + graphics.axisWidth;
                    graphics.rightTextLeftPoint = graphics.paddingLeft + graphics.axisWidth - graphics.indentRight;
                    graphics.axisStep = graphics.axisWidth / 100;
                    graphics.indentPlusDiamond = graphics.indentLeft - graphics.diamondsize;
                    graphics.axesString = 'M' + graphics.indentLeft + ' 0  L' + (graphics.axisRightPoint) + ' 0' + ' L' + (graphics.axisRightPoint) + ' ' + graphics.axisTab;
                    graphics.reverseAxesString = 'M' + graphics.indentLeft + ' ' + graphics.axisTab + ' L' + graphics.indentLeft + ' 0  L' + (graphics.axisRightPoint) + ' 0';
                }
                
                function removeAll() {
                    layerSingle.selectAll('*').remove();
                    activeLayer.selectAll('*').remove();
                    inactiveLayer.selectAll('*').remove();
                }
    
                // drag behaviour
                var slackRatios;
                var startX, startMouseX;
    
                var drag = d3.behavior.drag().on('dragstart', function() {
                    var slack = designSpace.slack;
                    var thisIndex = d3.select(this).attr('index');
                    $(".slider-container-" + thisIndex).attr("class", "slider-container-" + thisIndex + " dragging");
                    if (slack == thisIndex) {
                        slackRatios = setSlackRatio(slack);
                    }
                    startX = parseInt(d3.select(this).attr('cx'));
                    startMouseX = d3.event.sourceEvent.clientX;
                    dragActive = true;
                }).on('drag', function() {
                    // redraw slider and active axis
                    var slack = designSpace.slack;
                    var thisMouseX = d3.event.sourceEvent.clientX;
                    var deltaX = thisMouseX - startMouseX;
                    var xPosition = limitX(startX + deltaX);
                    var thisIndex = d3.select(this).attr('index');
                    var thisValue = (xPosition - graphics.indentLeft) / (graphics.axisStep);
                    var type = d3.select(this).attr('type');
                    if (thisIndex == slack) {
                        drawSlackAxes(slack, xPosition);
                        // change all others proportionally
                        for (var i = 0; i < thisInstance.axes.length; i++) {
                            if (i != slack) {
                                var proportionalValue = thisValue * slackRatios[i];
                                var proportionalPosition = proportionalValue * (graphics.axisStep) + graphics.indentLeft;
                                drawNormalAxes(i, proportionalPosition);
                                writeValueToModel(i, proportionalValue);
                            }
                        }
                    } else {
                        drawNormalAxes(thisIndex, xPosition);
                        // when current slider has the largest value, it drags the slack slider with it
                        if (thisInstance.axes.length > 1 && isLargestSlider(thisInstance, thisIndex, thisValue, slack)) {
                            drawSlackAxes(slack, xPosition);
                            writeValueToModel(slack, 100 - thisValue);
                        }
                    }

                }).on('dragend', function() {
                    var slack = designSpace.slack;
                    var thisMouseX = d3.event.sourceEvent.clientX;
                    var deltaX = thisMouseX - startMouseX;
                    var xPosition = limitX(startX + deltaX);
                    var thisIndex = d3.select(this).attr('index');
                    var thisValue = (xPosition - graphics.indentLeft) / (graphics.axisStep);
                    $(".slider-container-" + thisIndex).attr("class", "slider-container-" + thisIndex + " not-dragging");
                    // write value of this axis to model
                    // slackmaster: reverse active axis
                    if (thisIndex == slack) {
                        thisValue = 100 - thisValue;
                    }
                    writeValueToModel(thisIndex, thisValue);
                    thisInstance.updateMetapolationValues();
                    scope.$apply();
                    //scope.data.metapolate();
                    dragActive = false;
                });
    
                function setSlackRatio(slack) {
                    if (thisInstance.axes.length > 1) {
                        var ratios = [];
                        var highest = findHighest(slack);
    
                        var max = thisInstance.axes[highest].axisValue;
                        for (var i = 0; i < thisInstance.axes.length; i++) {
                            if (max != 0) {
                                ratios.push(thisInstance.axes[i].axisValue / max);
                            } else {
                                ratios.push(1);
                            }
                        }
                        return ratios;
                    }
                }
    
                function findHighest(slack) {
                    var highest;
                    var max = 0;
                    for (var i = 0; i < thisInstance.axes.length; i++) {
                        if (parseFloat(thisInstance.axes[i].axisValue) >= max && i != slack) {
                            highest = i;
                            max = parseFloat(thisInstance.axes[i].axisValue);
                        }
                    }
                    return highest;
                }
    
                function drawNormalAxes(axis, xPosition) {
                    d3.select("circle#slider" + axis).attr('cx', xPosition);
                    d3.select("path#axis-active" + axis).attr('d', 'M' + graphics.indentLeft + ' 0  L' + xPosition + ' 0');
                    d3.select('g#diamond' + axis).attr('transform', "translate(" + (xPosition - graphics.diamondsize) + ", -28)");
                }
    
                function drawSlackAxes(axis, xPosition) {
                    d3.select("circle#slider" + axis).attr('cx', xPosition);
                    d3.select("path#axis-active" + axis).attr('d', 'M' + xPosition + ' 0 L' + (graphics.axisRightPoint) + ' 0');
                    d3.select('g#diamond' + axis).attr('transform', "translate(" + (xPosition - graphics.diamondsize) + ", -28)");
                }
    
                function writeValueToModel(axis, value) {
                    designSpace.axes[axis].value = formatX(value);
                    thisInstance.axes[axis].axisValue = formatX(value);
                }
    
                function limitX(x) {
                    if (x < graphics.indentLeft) {
                        x = graphics.indentLeft;
                    }
                    if (x > (graphics.axisWidth + graphics.indentLeft)) {
                        x = graphics.axisWidth + graphics.indentLeft;
                    }
                    return x;
                }
    
                function formatX(x) {
                    var roundedX = Math.round(x * 10) / 10;
                    var toF = roundedX.toFixed(1);
                    return toF;
                }
    
                function isLargestSlider(instance, index, value, slack) {
                    var largest = true;
                    for (var i = 0; i < instance.axes.length; i++) {
                        if (instance.axes[i].axisValue > value && i != index && i != slack) {
                            largest = false;
                        }
                    }
                    return largest;
                }
            }
        };
    }
    controlDirective.$inject = [];
    return controlDirective;
});
