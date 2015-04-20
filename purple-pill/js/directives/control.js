app.directive('control', function($document) {
    return {
        restrict : 'E',
        link : function(scope, element, attrs, ctrl) {
            $(window).resize(function() {
                return redraw();
            });

            var dragActive = false;
            var designspace;
            var thisInstance;
            var svg = d3.select(element[0]).append('svg');
            var layer2 = svg.append('g');
            var layer1 = svg.append('g');

            var axisWidth;
            var paddingLeft = 50, paddingTop = 30, paddingLabel = 25, axisDistance = 50, axisTab = 10, axisTabLeft = 60, indentRight = 20, indentLeft = 40, diamondsize = 5, diamondPadding = diamondsize + 3, paddingRemoveButton = 6;
            var diamondShape = '0,' + diamondsize + ' ' + diamondsize + ',0 ' + 2 * diamondsize + ',' + diamondsize + ' ' + diamondsize + ',' + 2 * diamondsize;

            // watch for data changes and redraw
            scope.$watchCollection('[data.currentInstance, data.families[0].instances.length, data.currentDesignspace.trigger, data.currentDesignspace.masters.length, data.currentDesignspace.triangle, data.currentDesignspace]', function(newVals, oldVals, scope) {
                return redraw();
            }, true);
            scope.$watch('data.currentDesignspace.axes', function(newVal) {
                // prevent a redraw loop, this watch is for manual change of an input box
                if (!dragActive) {
                    return redraw();
                }
            }, true);

            /***** redraw *****/
            function redraw() {
                // responsive axes
                scope.designspaceWidth = $("#panel-3").outerWidth();
                axisWidth = scope.designspaceWidth - 200;
                var axesString = 'M' + indentLeft + ' 0  L' + (indentLeft + axisWidth) + ' 0' + ' L' + (indentLeft + axisWidth) + ' ' + axisTab;
                var reverseAxesString = 'M' + indentLeft + ' ' + axisTab + ' L' + indentLeft + ' 0  L' + (indentLeft + axisWidth) + ' 0';

                designspace = scope.data.currentDesignspace;
                var inactiveInstances = [];
                angular.forEach(scope.data.families, function(family) {
                    angular.forEach(family.instances, function(instance) {
                        // push inactive instances of this designspace
                        if (instance.designspace == designspace.id) {
                            if (instance == scope.data.currentInstance) {
                                thisInstance = instance;
                            } else {
                                inactiveInstances.push(instance);
                            }
                        }
                    });
                });
                // remove all previous items before render
                layer1.selectAll('*').remove();
                layer2.selectAll('*').remove();

                // draw inactive instances
                for ( i = 0; i < inactiveInstances.length; i++) {
                    for ( j = 0; j < inactiveInstances[i].axes.length; j++) {
                        //if (!(inactiveInstances[i].axes.length == 2 && j == 1)) {
                        layer2.append('g').attr('transform', function() {
                            if (j == scope.data.currentDesignspace.mainMaster) {
                                var x = paddingLeft - diamondsize + axisWidth / 100 * (100 - inactiveInstances[i].axes[j].value);
                            } else {
                                var x = paddingLeft - diamondsize + axisWidth / 100 * inactiveInstances[i].axes[j].value;
                            }
                            var y = j * axisDistance + paddingTop - diamondsize - diamondPadding;
                            return "translate(" + x + "," + y + ")";
                        }).append('polygon').attr('points', diamondShape).attr('class', 'blue-diamond').attr('stroke', function() {
                            return scope.data.colorCoding[inactiveInstances[i].id];
                        }).attr('fill', 'none');
                        //}
                    }
                }
                var diamondcolor = scope.data.colorCoding[thisInstance.id];

                // create slider containers
                var axes = layer1.selectAll('g').data(thisInstance.axes).enter().append('g').attr('transform', function(d, i) {
                    var x = paddingLeft - indentLeft;
                    var y = i * axisDistance + paddingTop;
                    return "translate(" + x + "," + y + ")";
                }).attr('class', 'not-dragging').attr('id', function(d, i) {
                    return 'slider-container-' + i;
                });

                // append axis itself
                axes.append('path').attr('d', function(d, i) {
                    if (i == designspace.mainMaster) {
                        return reverseAxesString;
                    } else {
                        return axesString;
                    }
                }).attr('class', 'slider-axis');
                // active axis
                axes.append('path').attr('d', function(d, i) {
                    if (i == designspace.mainMaster) {
                        return 'M' + ((100 - d.value) * (axisWidth / 100) + indentLeft) + ' 0 L' + (indentLeft + axisWidth) + ' 0';
                    } else {
                        return 'M' + indentLeft + ' 0  L' + (d.value * (axisWidth / 100) + indentLeft) + ' 0';
                    }
                }).attr('class', 'slider-axis-active').attr('id', function(d, i) {
                    return "axis-active" + i;
                });

                // for 1 master setup, the "just one more" text
                if (designspace.axes.length == 1) {
                    var tempAxis = layer1.append('g').attr('transform', function(d, i) {
                        var x = paddingLeft - indentLeft;
                        var y = axisDistance + paddingTop;
                        return "translate(" + x + "," + y + ")";
                    }).attr('class', 'slider-container');
                    tempAxis.append('path').attr('d', function(d, i) {
                        return axesString;
                    }).attr('class', 'slider-axis');
                    tempAxis.append('text').attr('x', paddingLeft + axisWidth - indentRight).attr('y', paddingLabel).text('Just one more...').attr('class', 'label-right-inactive slider-label');

                }

                // append slider handles and according diamond
                axes.append('circle').attr('r', 8).attr('cx', function(d, i) {
                    if (i == designspace.mainMaster) {
                        return (100 - d.value) * (axisWidth / 100) + indentLeft;
                    } else {
                        return d.value * (axisWidth / 100) + indentLeft;
                    }
                }).attr('cy', '0').attr('index', function(d, i) {
                    return i;
                }).attr('class', 'slider-handle').attr('id', function(d, i) {
                    return 'slider' + i;
                }).call(drag);

                axes.append('g').attr('id', function(d, i) {
                    return 'diamond' + i;
                }).attr('transform', function(d, i) {
                    if (i == designspace.mainMaster) {
                        return "translate(" + ((100 - d.value) * (axisWidth / 100) + indentLeft - diamondsize) + ", -25)";
                    } else {
                        return "translate(" + (d.value * (axisWidth / 100) + indentLeft - diamondsize) + ", -25)";
                    }
                }).append('polygon').attr('points', diamondShape).attr('fill', diamondcolor);

                // labels and remove buttons
                var label = axes.append('g').attr('transform', function(d, i) {
                    if (i == designspace.mainMaster) {
                        var x = paddingLeft - indentLeft - 10;
                    } else {
                        var x = paddingLeft + axisWidth - indentRight;
                    }
                    var y = paddingLabel;
                    return "translate(" + x + "," + y + ")";
                }).attr('class', 'slider-label-right-container').style('display', function(d, i) {
                    if (i != designspace.mainMaster || designspace.axes.length < 3) {
                        return 'block';
                    } else {
                        return 'none';
                    }
                });
                label.append('rect').attr('x', '0').attr('y', '-15').attr('width', '100').attr('height', '20').attr('fill', '#fff').attr('class', 'slider-hover-square');
                label.append('text').text(function(d, i) {
                    return scope.data.findMaster(thisInstance.axes[i].masterName).displayName;
                }).attr('class', function(d, i) {
                    return 'slider-label-right slider-label slider-label-' + i;
                }).attr('id', function(d, i) {
                    return 'slider-label-' + i;
                }).attr('x', 4);
                label.append('text').attr('x', function(d, i) {
                    var thisx = document.getElementById("slider-label-" + i).getBoundingClientRect().width;
                    thisx += paddingRemoveButton;
                    return thisx;
                }).attr('y', '2').text("o").attr('masterName', function(d, i) {
                    return thisInstance.axes[i].masterName;
                }).attr('class', 'slider-button slider-remove-master').on("click", function(d, i) {
                    var masterName = thisInstance.axes[i].masterName;
                    scope.removeMasterFromDesignspace(masterName, designspace, true);
                });
            }

            /***** drag behaviour *****/
            var slackRatios;
            var startX, startMouseX;

            var drag = d3.behavior.drag().on('dragstart', function() {
                var slack = designspace.mainMaster;
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
                var slack = designspace.mainMaster;
                var thisMouseX = d3.event.sourceEvent.clientX;
                var deltaX = thisMouseX - startMouseX;
                var xPosition = limitX(startX + deltaX);
                console.log(xPosition);
                var thisIndex = d3.select(this).attr('index');
                var thisValue = (xPosition - indentLeft) / (axisWidth / 100);
                var type = d3.select(this).attr('type');
                if (thisIndex == slack) {
                    drawSlackAxes(slack, xPosition);
                    // change all others proportionally
                    for (var i = 0; i < thisInstance.axes.length; i++) {
                        if (i != slack) {
                            var proportionalValue = thisValue * slackRatios[i];
                            var proportionalPosition = proportionalValue * (axisWidth / 100) + indentLeft;
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
                // write value of this axis to model
                // slackmaster: reverse active axis
                if (thisIndex == slack) {
                    thisValue = 100 - thisValue;
                }
                writeValueToModel(thisIndex, thisValue);
                // translate axis values to metapolation ratios
                scope.data.getMetapolationRatios(thisInstance);
                scope.$apply();
            }).on('dragend', function() {
                var thisIndex = d3.select(this).attr('index');
                $("#slider-container-" + thisIndex).attr("class", "not-dragging");
                scope.data.metapolate();
                dragActive = false;
            });

            function setSlackRatio(slack) {
                if (thisInstance.axes.length > 1) {
                    var ratios = [];
                    var highest = findHighest(slack);

                    var max = thisInstance.axes[highest].value;
                    for (var i = 0; i < thisInstance.axes.length; i++) {
                        if (max != 0) {
                            ratios.push(thisInstance.axes[i].value / max);
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
                    if (parseFloat(thisInstance.axes[i].value) >= max && i != slack) {
                        highest = i;
                        max = parseFloat(thisInstance.axes[i].value);
                    }
                }
                return highest;
            }

            function drawNormalAxes(axis, xPosition) {
                console.log(xPosition);
                d3.select("circle#slider" + axis).attr('cx', xPosition);
                d3.select("path#axis-active" + axis).attr('d', 'M' + indentLeft + ' 0  L' + xPosition + ' 0');
                d3.select('g#diamond' + axis).attr('transform', "translate(" + (xPosition - diamondsize) + ", -25)");
            }

            function drawSlackAxes(axis, xPosition) {
                d3.select("circle#slider" + axis).attr('cx', xPosition);
                d3.select("path#axis-active" + axis).attr('d', 'M' + xPosition + ' 0 L' + (indentLeft + axisWidth) + ' 0');
                d3.select('g#diamond' + axis).attr('transform', "translate(" + (xPosition - diamondsize) + ", -25)");
            }

            function writeValueToModel(axis, value) {
                designspace.axes[axis].value = formatX(value);
                thisInstance.axes[axis].value = formatX(value);
            }

            function limitX(x) {
                if (x < indentLeft) {
                    x = indentLeft;
                }
                if (x > (axisWidth + indentLeft)) {
                    x = axisWidth + indentLeft;
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
                    if (instance.axes[i].value > value && i != index && i != slack) {
                        largest = false;
                    }
                }
                return largest;
            }

        }
    };
});
