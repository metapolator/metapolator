app.directive('control', function($document) {
    return {
        restrict : 'E',
        link : function(scope, element, attrs, ctrl) {
            var dragActive = false;
            var designSpace;
            var thisInstance;
            var svg = d3.select(element[0]).append('svg');
            var layer2 = svg.append('g');
            var layer1 = svg.append('g');
            var paddingLeft = 50, paddingTop = 30, axisWidth = 200, paddingLabel = 25, axisDistance = 40, axisTab = 10, axisTabLeft = 60, indentRight = 20, indentLeft = 40, diamondsize = 5, diamondPadding = diamondsize + 3;

            // watch for data changes and redraw
            scope.$watchCollection('[data.currentInstance, data.families[0].instances.length, data.currentDesignSpace.trigger, data.currentDesignSpace.masters.length, data.currentDesignSpace.triangle, data.currentDesignSpace]', function(newVals, oldVals, scope) {
                return redraw();
            }, true);
            scope.$watch('data.currentDesignSpace.axes', function(newVal) {
                // prevent a redraw loop, this watch is for manual change of an input box
                if (!dragActive) {
                    return redraw();
                }
            }, true);

            /***** redraw *****/
            function redraw() {
                designSpace = scope.data.currentDesignSpace;
                var inactiveInstances = [];
                angular.forEach(scope.data.families, function(family) {
                    angular.forEach(family.instances, function(instance) {
                        // push inactive instances of this designspace
                        if (instance.designSpace == designSpace.id) {
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
                var diamonds = layer2.selectAll('g').data(inactiveInstances).enter().append('g').selectAll('polygon').data(function(d) {
                    return d.axes;
                }).enter().append('g').attr('transform', function(d, i) {
                    var x = paddingLeft - diamondsize + axisWidth / 100 * d.value;
                    var y = i * axisDistance + paddingTop - diamondsize - diamondPadding;
                    return "translate(" + x + "," + y + ")";
                }).append('polygon').attr('points', '0,' + diamondsize + ' ' + diamondsize + ',0 ' + 2 * diamondsize + ',' + diamondsize + ' ' + diamondsize + ',' + 2 * diamondsize).attr('class', 'blue-diamond');

                /***** One master in Design Space *****/
                if (designSpace.axes.length == 1) {
                    // create slider containers
                    var axes = layer1.append('g').attr('transform', function() {
                        var x = paddingLeft - indentLeft;
                        var y = paddingTop;
                        return "translate(" + x + "," + y + ")";
                    }).attr('class', 'slider-container');

                    // append axis itself
                    axes.append('path').attr('d', 'M' + indentLeft + ' 0  L' + (indentLeft + axisWidth) + ' 0').attr('class', 'slider-axis');
                    axes.append('path').attr('d', 'M' + indentLeft + ' ' + axisTab + ' L' + indentLeft + ' 0  L' + (thisInstance.axes[0].value * (axisWidth / 100) + indentLeft) + ' 0').attr('class', 'slider-axis-active').attr('id', "axis-active0");

                    // append slider handles
                    axes.append('circle').attr('r', 8).attr('cx', thisInstance.axes[0].value * (axisWidth / 100) + indentLeft).attr('cy', '0').attr('index', 0).attr('class', 'slider-handle').attr('id', 'slider0').call(drag);

                    // create left label
                    //axes.append('text').attr('x', paddingLeft - indentLeft).attr('y', paddingLabel).text(scope.data.findMaster(thisInstance.axes[0].masterName).displayName).attr('class', 'slider-label-left slider-label');

                    // create left label and remove button
                    var leftlabels = axes.append('g').attr('transform', function() {
                        var x = paddingLeft - indentLeft;
                        var y = paddingLabel;
                        return "translate(" + x + "," + y + ")";
                    }).attr('class', 'slider-label-right-container');
                    leftlabels.append('rect').attr('x', '0').attr('y', '-15').attr('width', '100').attr('height', '20').attr('fill', '#fff').attr('class', 'slider-hover-square');
                    leftlabels.append('text').text(scope.data.findMaster(thisInstance.axes[0].masterName).displayName).attr('class', 'slider-label-right slider-label').attr('x', 16);
                    leftlabels.append('text').attr('x', 0).attr('y', '2').text("o").attr('masterName', thisInstance.axes[0].masterName).attr('class', 'slider-button slider-remove-master').on('click', function() {
                        scope.removeMaster(0);
                    });

                    // create right label
                    axes.append('text').attr('x', paddingLeft + axisWidth - indentRight).attr('y', paddingLabel).text('Just one more...').attr('class', 'label-right-inactive slider-label');
                } else {
                    /***** Two master in Design Space -> no 'slack master' *****/
                    if (designSpace.axes.length == 2) {
                        // create slider containers
                        var axes = layer1.append('g').attr('transform', function() {
                            var x = paddingLeft - indentLeft;
                            var y = paddingTop;
                            return "translate(" + x + "," + y + ")";
                        }).attr('class', 'slider-container');

                        // append axis itself
                        axes.append('path').attr('d', function() {
                            return 'M' + indentLeft + ' ' + axisTab + ' L' + indentLeft + ' 0  L' + (indentLeft + axisWidth) + ' 0 L' + (indentLeft + axisWidth) + ' ' + axisTab;
                        }).attr('class', 'slider-axis-active');

                        // append slider handles
                        axes.append('circle').attr('r', 8).attr('cx', thisInstance.axes[0].value * (axisWidth / 100) + indentLeft).attr('cy', '0').attr('index', 0).attr('class', 'slider-handle').attr('type', 'two-master-handle').call(drag);

                        // create right label
                        //axes.append('text').attr('x', paddingLeft + axisWidth - indentRight).attr('y', paddingLabel).text(scope.data.findMaster(thisInstance.axes[1].masterName).displayName).attr('class', 'slider-label-right slider-label');

                        var rightlabel = axes.append('g').attr('transform', function() {
                            var x = paddingLeft + axisWidth - indentRight;
                            var y = paddingLabel;
                            return "translate(" + x + "," + y + ")";
                        }).attr('class', 'slider-label-right-container');
                        rightlabel.append('rect').attr('x', '0').attr('y', '-15').attr('width', '100').attr('height', '20').attr('fill', '#fff').attr('class', 'slider-hover-square');
                        rightlabel.append('text').text(scope.data.findMaster(thisInstance.axes[1].masterName).displayName).attr('class', 'slider-label-right slider-label').attr('x', 16);
                        rightlabel.append('text').attr('x', 0).attr('y', '2').text("o").attr('masterName', thisInstance.axes[1].masterName).attr('class', 'slider-button slider-remove-master').on('click', function() {
                            scope.removeMaster(1);
                        });
                    }

                    /***** More masters in Design Space *****/
                    else {
                        // create slider containers
                        var axes = layer1.selectAll('g').data(thisInstance.axes).enter().append('g').attr('transform', function(d, i) {
                            var x = paddingLeft - indentLeft;
                            var y = i * axisDistance + paddingTop;
                            return "translate(" + x + "," + y + ")";
                        }).attr('class', 'slider-container');

                        // append axis itself
                        axes.append('path').attr('d', function(d, i) {
                            return 'M' + indentLeft + ' 0  L' + (indentLeft + axisWidth) + ' 0';
                        }).attr('class', 'slider-axis');
                        // active axis
                        axes.append('path').attr('d', function(d, i) {
                            if (i == designSpace.mainMaster) {
                                return 'M' + ((100 - d.value) * (axisWidth / 100) + indentLeft) + ' 0 L' + (indentLeft + axisWidth) + ' 0  L' + (indentLeft + axisWidth) + ' ' + axisTab;
                            } else {
                                return 'M' + indentLeft + ' ' + axisTab + ' L' + indentLeft + ' 0  L' + (d.value * (axisWidth / 100) + indentLeft) + ' 0';
                            }
                        }).attr('class', 'slider-axis-active').attr('id', function(d, i) {
                            return "axis-active" + i;
                        });

                        // append slider handles
                        axes.append('circle').attr('r', 8).attr('cx', function(d, i) {
                            if (i == designSpace.mainMaster) {
                                return (100 - d.value) * (axisWidth / 100) + indentLeft;
                            } else {
                                return d.value * (axisWidth / 100) + indentLeft;
                            }
                        }).attr('cy', '0').attr('index', function(d, i) {
                            return i;
                        }).attr('class', 'slider-handle').attr('id', function(d, i) {
                            return 'slider' + i;
                        }).call(drag);
                    }

                    // left labels and remove buttons
                    var leftlabels = axes.append('g').attr('transform', function(d, i) {
                        var x = paddingLeft - indentLeft;
                        var y = paddingLabel;
                        return "translate(" + x + "," + y + ")";
                    }).attr('class', 'slider-label-right-container');
                    leftlabels.append('rect').attr('x', '0').attr('y', '-15').attr('width', '100').attr('height', '20').attr('fill', '#fff').attr('class', 'slider-hover-square');
                    leftlabels.append('text').text(function(d, i) {
                        if (i != designSpace.mainMaster) {
                            return scope.data.findMaster(thisInstance.axes[i].masterName).displayName;
                        }
                    }).attr('class', 'slider-label-right slider-label').attr('x', 16);
                    leftlabels.append('text').attr('x', 0).attr('y', '2').text("o").attr('masterName', function(d, i) {
                        return thisInstance.axes[i].masterName;
                    }).attr('class', 'slider-button slider-remove-master').attr('style', function(d, i) {
                        if (i != designSpace.mainMaster) {
                            return 'display: block';
                        } else {
                            return 'display: none';
                        }
                    }).on("click", function(d, i) {
                        scope.removeMaster(i);
                    });

                    scope.getMetapolationRatios();
                }
            }

            /***** drag behaviour *****/
            var slackRatios;
            var drag = d3.behavior.drag().on('dragstart', function() {
                var slack = designSpace.mainMaster;
                var thisIndex = d3.select(this).attr('index');
                if (slack == thisIndex) {
                    slackRatios = setSlackRatio(slack);
                }
                dragActive = true;
            }).on('drag', function() {
                // redraw slider and active axis
                var slack = designSpace.mainMaster;
                var xPosition = limitX(d3.event.x);
                var thisIndex = d3.select(this).attr('index');
                var thisValue = (xPosition - indentLeft) / (axisWidth / 100);
                var type = d3.select(this).attr('type');
                // don't redraw the axis when we have two masters

                if (type != 'two-master-handle') {
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
                } else {
                    d3.select(this).attr('cx', xPosition);
                    writeValueToModel(1, 100 - thisValue);
                }
                // write value of this axis to model
                // slackmaster: reverse active axis
                if (thisIndex == slack) {
                    thisValue = 100 - thisValue;
                }
                writeValueToModel(thisIndex, thisValue);
                // translate axis values to metapolation ratios
                scope.getMetapolationRatios();
                scope.$apply();
            }).on('dragend', function() {
                scope.data.metapolate();
                dragActive = false;
            });

            function setSlackRatio(slack) {
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

            function findHighest(slack) {
                var highest;
                var max = 0;
                for (var i = 0; i < thisInstance.axes.length; i++) {
                    if (parseFloat(thisInstance.axes[i].value) > max && i != slack) {
                        highest = i;
                        max = parseFloat(thisInstance.axes[i].value);
                    }
                }
                return highest;
            }

            function drawNormalAxes(axis, xPosition) {
                d3.select("circle#slider" + axis).attr('cx', xPosition);
                d3.select("path#axis-active" + axis).attr('d', 'M' + indentLeft + ' ' + axisTab + ' L' + indentLeft + ' 0  L' + xPosition + ' 0');
            }

            function drawSlackAxes(axis, xPosition) {
                d3.select("circle#slider" + axis).attr('cx', xPosition);
                d3.select("path#axis-active" + axis).attr('d', 'M' + xPosition + ' 0 L' + (indentLeft + axisWidth) + ' 0  L' + (indentLeft + axisWidth) + ' ' + axisTab);
            }

            function writeValueToModel(axis, value) {
                designSpace.axes[axis].value = formatX(value);
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
                var roundedX = Math.round(x * 2) / 2;
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
