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
                var myd3 = true;
    
                var dragActive = false;
                var designSpace = null;
                var thisInstance = null;
                var inactiveInstances = [];
                var svg = d3.select(element[0]).append('svg');
                var layerSingle = svg.append('g').attr('class', 'single-layer');
                var axesLayer = svg.append('g').attr('class', 'axesLayer');
                
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
                
                scope.$watch('instancePanel.currentInstance', function(newVal, oldVal) {
                    if (!dragActive) {
                        if (newVal == null) {
                            // no current instance, so create an empty svg
                            return removeAll();
                        } else {
                            if (oldVal == null || newVal.id != oldVal.id) {
                                // a new current instance, so a complete redraw
                                return redrawFunction();
                            } else if (newVal.axes.length > oldVal.axes.length) {
                                // an axis has been added
                                var l = newVal.axes.length - 1;
                                var newAxis = newVal.axes[l];
                                return drawAxisFunction(newAxis, l);
                            } else if (newVal.axes.length < oldVal.axes.length) {
                                // an axis has been removed
                                // we could make this more efficient, for now a complete redraw
                                return redrawFunction();
                            }
                        }
                    }
                }, true);
                
                var starttime = null;
                var svgAxes = [];
                            
                function redrawFunction() {
                    buildData();
                    removeAll();
                    starttime = Date.now();
                    console.log("start: " + starttime);
                    drawAll();
                    console.log("end: " + (Date.now() - starttime));
                }
                
                function buildData() {
                    var nrOfInstances = 0;
                    designSpace = scope.model;
                    for (var i = scope.instancePanel.sequences.length - 1; i >= 0; i--) {
                        var sequence = scope.instancePanel.sequences[i];
                        for (var j = 0, jl = sequence.children.length; j < jl; j++) {
                            var instance = sequence.children[j];
                            if (instance == scope.instancePanel.currentInstance) {
                                var current = true;
                            } else {
                                var current = false;
                            }
                            if (j == designSpace.slack) {
                                var thisSlack = true;
                            } else {
                                var thisSlack = false;
                            }
                            if (instance.designSpace == designSpace) {
                                for (var k = 0, l = instance.axes.length; k < l; k++) {
                                    var thisAxis = instance.axes[k];
                                    if (!svgAxes[k]) {
                                        svgAxes[k] = {};
                                        svgAxes[k].instances = [];
                                    }
                                    if (current) {
                                       svgAxes[k].instanceName = thisAxis.master.displayName; 
                                       svgAxes[k].value = thisAxis.axisValue;
                                       svgAxes[k].slack = thisSlack; //?
                                    }
                                    var thisInstance = {};
                                    thisInstance.value = thisAxis.axisValue;
                                    thisInstance.color = instance.color;
                                    thisInstance.thisInstance = current;
                                    thisInstance.slack = thisSlack;
                                    thisInstance.name = instance.name;
                                    svgAxes[k].instances[nrOfInstances] = thisInstance;
                                }
                            }
                            nrOfInstances++;
                        }
                    }     
                }
                
                function drawAll() {
                    var data = svgAxes;
                    //console.log(data);
                    // drawing containers
                    var axisContainer = axesLayer.selectAll('g.slider-container').data(data).enter().append('g').attr('transform', function(axes, index) {
                        var x = graphics.leftOffset;
                        var y = index * graphics.axisDistance + graphics.paddingTop;
                        return "translate(" + x + "," + y + ")";
                    }).attr('class', 'slider-container');
                    // drawing diamonds
                    
                    axisContainer.selectAll("g.diamond-container").data(function(axis,index) { 
                        return axis.instances; 
                    }).enter().append('g').attr('transform', function(instance, index) {
                        if (instance.slack) {
                            return "translate(" + ((100 - instance.value) * (graphics.axisStep) + graphics.indentPlusDiamond) + ", -28)";
                        } else {
                            return "translate(" + (instance.value * (graphics.axisStep) + graphics.indentPlusDiamond) + ", -28)";
                        }
                    }).attr('class', 'diamond-container')
                      .append('polygon')
                      .attr('points', graphics.diamondShape)
                      .attr('fill', function(instance, index) {
                          if (instance.thisInstance) {
                              return instance.color;
                          } else {
                              return 'none';
                          }
                      }).attr('stroke', function(instance, index) {
                          return instance.color;
                      })
                      .attr('class', function(instance, index) {
                          return 'design-space-diamond instance-' + instance.name;
                      })
                      .attr('stroke-width', 2);
                      
                      // draw grey axes
                      axisContainer.append('path').attr('d', function(axis, index) {
                        if (axis.slack) {
                            return graphics.reverseAxesString;
                        } else {
                            return graphics.axesString;
                        }
                      }).attr('class', 'slider-axis');
                    
                      axisContainer.append('path').attr('d', function(axis, index) {
                        if (axis.slack) {
                            return 'M' + ((100 - axis.value) * (graphics.axisStep) + graphics.indentLeft) + ' 0 L' + (graphics.axisRightPoint) + ' 0';
                        } else {
                            return 'M' + graphics.indentLeft + ' 0  L' + (axis.value * (graphics.axisStep) + graphics.indentLeft) + ' 0';
                        }
                      }).attr('class', 'slider-axis-active');
                     
                     // draw handle 
                    axisContainer.append('circle').attr('r', 8).attr('cx', function(axis, index) {
                        if (axis.slack) {
                            return (100 - axis.value) * (graphics.axisStep) + graphics.indentLeft;
                        } else {
                            return axis.value * (graphics.axisStep) + graphics.indentLeft;
                        }
                    }).attr('cy', '0').attr('index', function(axis, index) {
                        return index;
                    }).attr('class', 'slider-handle').attr('id', function(axis, index) {
                        return 'slider' + index;
                    }).call(drag);
                    
                    // draw label
                    var label = axisContainer.append('g').attr('transform', function(axis, index) {
                        if (axis.slackk) {
                            var x = graphics.leftOffset - 10;
                        } else {
                            var x = graphics.rightTextLeftPoint;
                        }
                        var y = graphics.paddingLabel;
                        return "translate(" + x + "," + y + ")";
                    }).attr('class', 'slider-label-container').style('display', function(axis, index) {
                        if (axis.slack || designSpace.axes.length < 3) {
                            return 'block';
                        } else {
                            return 'none';
                        }
                    });
                    label.append('rect').attr('x', '0').attr('y', '-15').attr('width', '100').attr('height', '20').attr('fill', 'transparent').attr('class', 'slider-hover-square');
                    label.append('text').text(function(axis,index) {
                        return axis.name;
                    }).attr('class', function(axis, index) {
                        return 'slider-label-right slider-label slider-label-' + index;
                    }).attr('id', function(axis, index) {
                        return 'slider-label-' + index;
                    }).attr('x', 4);
                    
                    //remove button
                    var removeButton = label.append('g').attr('transform', function(axis, index) {
                        var x = document.getElementById("slider-label-" + index).getBoundingClientRect().width;
                        x += graphics.paddingRemoveButton + 10;
                        var y = 0;
                        return "translate(" + x + "," + y + ")";
                    }).attr('class', 'remove-master-g');
                    removeButton.append('circle').attr('cx', 3).attr('cy', -2).attr('r', 7).attr('class', 'remove-master-bg');
                    removeButton.append('text').attr('x', 0).attr('y', '2').text("×").attr('masterName', function(axis, index) {
                        return axis.name;
                    }).attr('class', 'remove-master-text').on("click", function() {
                        scope.removeMaster(master, designSpace);
                    });
                    
                }
                
                
                
                
                
                function drawAxisFunctionD3(axes) {
                    if (thisInstance.axes.length == 1) {
                        drawSingleExtras();
                    }  
                    var axisContainer = axesLayer.selectAll('g').data(thisInstance.axes).enter().append('g').attr('transform', function(axis, index) {
                        var x = graphics.leftOffset;
                        var y = index * graphics.axisDistance + graphics.paddingTop;
                        return "translate(" + x + "," + y + ")";
                    }).attr('class', 'not-dragging').attr('id', function(axis, index) {
                        return 'slider-container-' + index;
                    });
                    axisContainer.append('path').attr('d', function(axis, index) {
                        if (designSpace.slack == index) {
                            return graphics.reverseAxesString;
                        } else {
                            return graphics.axesString;
                        }
                    }).attr('class', 'slider-axis');
                    
                    axisContainer.append('path').attr('d', function(axis, index) {
                        if (designSpace.slack == index) {
                            return 'M' + ((100 - axis.axisValue) * (graphics.axisStep) + graphics.indentLeft) + ' 0 L' + (graphics.axisRightPoint) + ' 0';
                        } else {
                            return 'M' + graphics.indentLeft + ' 0  L' + (axis.axisValue * (graphics.axisStep) + graphics.indentLeft) + ' 0';
                        }
                    }).attr('class', 'slider-axis-active').attr('id', function(axis, index) {
                        return "axis-active" + index;
                    });
                    
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
                    
                    inactiveAxesD3();
                }
                
                function inactiveAxesD3() {
                    layer2.selectAll('g').data(inactiveInstances).enter().append('g').attr('transform', function(d, index) {
                        var y = index * graphics.axisDistance + graphics.paddingTop - 28;
                        return "translate(0, " + y + ")";
                    })
                    .selectAll("g").data(function(d,i) { 
                        return d; 
                    }).append('g').attr('transform', function() {
                        if (index == designSpace.slack) {
                            var x = graphics.paddingLeft - graphics.diamondsize + graphics.axisWidth / 100 * (100 - value);
                        } else {
                            var x = graphics.paddingLeft - graphics.diamondsize + graphics.axisWidth / 100 * value;
                        }
                        return "translate(" + x + ", 0)";
                    }).append('polygon')
                      .attr('points', graphics.diamondShape);
                      //.attr('class', 'design-space-diamond instance-' + instance.name)
                      //.attr('stroke', function() {
                      //  return instance.color;
                    //}).attr('fill', 'none').attr('stroke-width', 2); 
                }
    
                
    
    
                function drawAxisFunction(axis, index) {
                    var slack = false
                       , value = axis.axisValue
                       , axisContainer = drawAxisContainer(axis, index);
                    // remove the single axis content
                    if (index == 1) {
                        layerSingle.selectAll('*').remove();
                    }
                    if (designSpace.slack == index) {
                        slack = true;
                    }
                    
                    drawAxis(axisContainer, index, value, slack);
                    if (thisInstance.axes.length == 1) {
                        drawSingleExtras();
                    }  
                    drawSliderHandle(axisContainer, index, value, slack);
                    drawLabel(axisContainer, index, axis.master);
                    
                    // draw the new inactiveInstance axes
                    for (var i = 0, l = inactiveInstances.length ; i < l; i++) {
                        var instance = inactiveInstances[i];
                        drawInactiveAxis(instance, axis, index);
                    }
                }
                
                
                
                
                
                
                
                function initialBuildGraphics() {
                    responsiveGraphics();
                    buildGraphics(); 
                }
                
                function responsiveGraphics() {
                    graphics.elementWidth = $(element).outerWidth();
                    graphics.axisWidth = graphics.elementWidth - 200;
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
                    axesLayer.selectAll('*').remove();
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
                
                function drawAxisContainer(axis, index) {
                    var axisContainer = axesLayer.append('g').attr('transform', function() {
                        var x = graphics.leftOffset;
                        var y = index * graphics.axisDistance + graphics.paddingTop;
                        return "translate(" + x + "," + y + ")";
                    }).attr('class', 'not-dragging').attr('id', function() {
                        return 'slider-container-' + index;
                    });
                    return axisContainer;
                }
                
                function drawAxis(axisContainer, index, value, slack) {
                    axisContainer.append('path').attr('d', function() {
                        if (slack) {
                            return graphics.reverseAxesString;
                        } else {
                            return graphics.axesString;
                        }
                    }).attr('class', 'slider-axis');
                    axisContainer.append('path').attr('d', function() {
                        if (slack) {
                            return 'M' + ((100 - value) * (graphics.axisStep) + graphics.indentLeft) + ' 0 L' + (graphics.axisRightPoint) + ' 0';
                        } else {
                            return 'M' + graphics.indentLeft + ' 0  L' + (value * (graphics.axisStep) + graphics.indentLeft) + ' 0';
                        }
                    }).attr('class', 'slider-axis-active').attr('id', function() {
                        return "axis-active" + index;
                    });
                }
                
                function drawSliderHandle(axisContainer, index, value, slack) {
                    axisContainer.append('circle').attr('r', 8).attr('cx', function() {
                        if (slack) {
                            return (100 - value) * (graphics.axisStep) + graphics.indentLeft;
                        } else {
                            return value * (graphics.axisStep) + graphics.indentLeft;
                        }
                    }).attr('cy', '0').attr('index', function() {
                        return index;
                    }).attr('class', 'slider-handle').attr('id', function() {
                        return 'slider' + index;
                    }).call(drag);
    
                    axisContainer.append('g').attr('id', function() {
                        return 'diamond' + index;
                    }).attr('transform', function() {
                        if (slack) {
                            return "translate(" + ((100 - value) * (graphics.axisStep) + graphics.indentPlusDiamond) + ", -28)";
                        } else {
                            return "translate(" + (value * (graphics.axisStep) + graphics.indentPlusDiamond) + ", -28)";
                        }
                    }).append('polygon')
                      .attr('points', graphics.diamondShape)
                      .attr('fill', thisInstance.color)
                      .attr('stroke', thisInstance.color)
                      .attr('class', 'design-space-diamond instance-' + thisInstance.name)
                      .attr('stroke-width', 2);
                 }
                
                function drawInactiveInstances() {
                    for (var i = 0, l = inactiveInstances.length ; i < l; i++) {
                        var instance = inactiveInstances[i];
                        for (var j = 0, m = instance.axes.length ; j < m; j++) {
                            var axis = instance.axes[i];
                            drawInactiveAxis(instance, axis, j);
                        }
                    }
                }
                
                function drawInactiveAxis(instance, axis, index) {
                    var value = axis.axisValue;
                    layer2.append('g').attr('transform', function() {
                        if (index == designSpace.slack) {
                            var x = graphics.paddingLeft - graphics.diamondsize + graphics.axisWidth / 100 * (100 - value);
                        } else {
                            var x = graphics.paddingLeft - graphics.diamondsize + graphics.axisWidth / 100 * value;
                        }
                        var y = index * graphics.axisDistance + graphics.paddingTop - 28;
                        return "translate(" + x + "," + y + ")";
                    }).append('polygon')
                      .attr('points', graphics.diamondShape)
                      .attr('class', 'design-space-diamond instance-' + instance.name)
                      .attr('stroke', function() {
                        return instance.color;
                    }).attr('fill', 'none').attr('stroke-width', 2); 
                }
                
                function drawLabel(axisContainer, index, master) {
                    var label = axisContainer.append('g').attr('transform', function() {
                        if (index == designSpace.slack) {
                            var x = graphics.leftOffset - 10;
                        } else {
                            var x = graphics.rightTextLeftPoint;
                        }
                        var y = graphics.paddingLabel;
                        return "translate(" + x + "," + y + ")";
                    }).attr('class', 'slider-label-container').style('display', function() {
                        if (index != designSpace.slack || designSpace.axes.length < 3) {
                            return 'block';
                        } else {
                            return 'none';
                        }
                    });
                    label.append('rect').attr('x', '0').attr('y', '-15').attr('width', '100').attr('height', '20').attr('fill', 'transparent').attr('class', 'slider-hover-square');
                    label.append('text').text(master.displayName).attr('class', function() {
                        return 'slider-label-right slider-label slider-label-' + index;
                    }).attr('id', function() {
                        return 'slider-label-' + index;
                    }).attr('x', 4);
                    //remove button
                    var removeButton = label.append('g').attr('transform', function() {
                        var x = document.getElementById("slider-label-" + index).getBoundingClientRect().width;
                        x += graphics.paddingRemoveButton + 10;
                        var y = 0;
                        return "translate(" + x + "," + y + ")";
                    }).attr('class', 'remove-master-g');
                    removeButton.append('circle').attr('cx', 3).attr('cy', -2).attr('r', 7).attr('class', 'remove-master-bg');
                    removeButton.append('text').attr('x', 0).attr('y', '2').text("×").attr('masterName', master.displayName).attr('class', 'remove-master-text').on("click", function() {
                        scope.removeMaster(master, designSpace);
                    });
                }
                
    
                /***** drag behaviour *****/
                var slackRatios;
                var startX, startMouseX;
    
                var drag = d3.behavior.drag().on('dragstart', function() {
                    var slack = designSpace.slack;
                    var thisIndex = d3.select(this).attr('index');
                    $("#slider-container-" + thisIndex).attr("class", "dragging");
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
                    $("#slider-container-" + thisIndex).attr("class", "not-dragging");
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
