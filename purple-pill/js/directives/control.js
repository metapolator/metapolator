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
            var paddingLeft = 50, paddingTop = 30, axisWidth = 200, paddingLabel = 25, axisDistance = 40, axisTab = 10,  axisTabLeft = 60, indentRight = 20, indentLeft = 40, diamondsize = 6, diamondPadding = 2 * diamondsize;

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
                var diamonds = layer2.selectAll('g').data(inactiveInstances).enter().append('g').selectAll('polygon').data(function(d){
                    return d.axes;
                }).enter().append('g').attr('transform', function (d, i) {
                    var x = paddingLeft - diamondsize + axisWidth / 100 * d.value;
                    var y = i * axisDistance + paddingTop - diamondsize - diamondPadding;
                    return "translate(" + x + "," + y + ")";
                }).append('polygon').attr('points', '0,6 6,0 12,6, 6,12').attr('class', 'blue-diamond');

               


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
                    axes.append('path').attr('d', 'M' + indentLeft + ' ' + axisTab + ' L' + indentLeft + ' 0  L' + (thisInstance.axes[0].value  * (axisWidth / 100) + indentLeft) + ' 0').attr('class', 'slider-axis-active').attr('id', "axis-active0");
                    
                    // append slider handles
                    axes.append('circle').attr('r', 8).attr('cx', thisInstance.axes[0].value * (axisWidth / 100) + indentLeft).attr('cy', '0').attr('index', 0).attr('class', 'slider-handle').call(drag);

                    // create left label
                    axes.append('text').attr('x', paddingLeft - indentLeft).attr('y', paddingLabel).text(scope.data.findMaster(thisInstance.axes[0].masterName).displayName).attr('class', 'slider-label-left slider-label');

                    // create right label
                    axes.append('text').attr('x', paddingLeft + axisWidth - indentRight).attr('y', paddingLabel).text('Just one more...').attr('class', 'label-right-inactive slider-label'); 
                }
                else {
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
                        axes.append('text').attr('x', paddingLeft + axisWidth - indentRight).attr('y', paddingLabel).text( scope.data.findMaster(thisInstance.axes[1].masterName).displayName).attr('class', 'slider-label-right slider-label');
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
                                return 'M' + (d.value * (axisWidth / 100) + indentLeft) + ' 0 L' + (indentLeft + axisWidth) + ' 0  L' + (indentLeft + axisWidth) + ' ' + axisTab;
                            } else {
                               return 'M' + indentLeft + ' ' + axisTab + ' L' + indentLeft + ' 0  L' + (d.value * (axisWidth / 100) + indentLeft) + ' 0'; 
                            }
                        }).attr('class', 'slider-axis-active').attr('id', function(d, i) {
                            return "axis-active" + i;
                        });
                        
                        // append slider handles
                        axes.append('circle').attr('r', 8).attr('cx', function(d) {
                            return d.value * (axisWidth / 100) + indentLeft;
                        }).attr('cy', '0').attr('index', function(d, i) {
                            return i;
                        }).attr('class', 'slider-handle').attr('id', function(d, i) {
                            return 'slider' + i;
                        }).call(drag);
                    }
                        
                    // create left label
                    axes.append('text').attr('x', paddingLeft - indentLeft).attr('y', paddingLabel).text(function(d, i) {
                        if (i != designSpace.mainMaster) {
                            return scope.data.findMaster(thisInstance.axes[i].masterName).displayName;
                        }
                    }).attr('class', 'slider-label-left slider-label');

                        // create rigth label
                        /*
                        var rightlabels = axes.append('g').attr('transform', function(d, i) {
                            var x = indentLeft + axisWidth - indentRight;
                            var y = paddingLabel;
                            return "translate(" + x + "," + y + ")";
                        }).attr('class', 'slider-label-right-container');
    
                        rightlabels.append('rect').attr('x', '0').attr('y', '-15').attr('width', '100').attr('height', '20').attr('fill', '#fff').attr('class', 'slider-hover-square');
    
                        rightlabels.append('text').text(function(d, i) {
                            return scope.data.findMaster(thisInstance.axes[i + 1].masterName).displayName;
                        }).attr('class', 'slider-label-right slider-label');
    
                        rightlabels.append('text').attr('x', '80').attr('y', '2').text("o").attr('masterid', function(d, i) {
                            return i;
                        }).attr('class', 'slider-button slider-remove-master').on("click", function(d, i) {
                            scope.removeMaster(i + 1);
                        });
                        */
    
                    scope.getMetapolationRatios();
                }
            }
            
           /***** drag behaviour *****/
           var drag = d3.behavior.drag().on('dragstart', function() {
                dragActive = true;
                //d3.select(this).attr('stroke', '#f85c37').attr('stroke-width', '4');
            }).on('drag', function() {
                // redraw slider and active axis
                var slack = designSpace.mainMaster;
                var xPosition = limitX(d3.event.x);
                d3.select(this).attr('cx', xPosition);
                var thisIndex = d3.select(this).attr('index');
                var thisValue = (xPosition - indentLeft) / (axisWidth / 100);
                // don't redraw the axis when we have two masters
                var type = d3.select(this).attr('type');
                if (type != 'two-master-handle') {
                    var activeAxis = d3.select("path#axis-active" + thisIndex);
                    // slackmaster: reverse active axis
                    if (thisIndex == designSpace.mainMaster) {
                        activeAxis.attr('d', 'M' + xPosition + ' 0 L' + (indentLeft + axisWidth) + ' 0  L' + (indentLeft + axisWidth) + ' ' + axisTab);
                    } else {
                        activeAxis.attr('d', 'M' + indentLeft + ' ' + axisTab + ' L' + indentLeft + ' 0  L' + xPosition + ' 0');
                        // when current slider has the largest value, it drags the slack slider with it
                        if (isLargestSlider(thisInstance, thisIndex, thisValue, slack)) {
                            d3.select("circle#slider" + slack).attr('cx', xPosition);
                            d3.select("path#axis-active" + slack).attr('d', 'M' + xPosition + ' 0 L' + (indentLeft + axisWidth) + ' 0  L' + (indentLeft + axisWidth) + ' ' + axisTab);
                            thisInstance.axes[designSpace.mainMaster].value = formatX(100 - thisValue);
                        }
                    }

                }
                // write value of this axis to model
                // slackmaster: reverse active axis
                if (thisIndex == designSpace.mainMaster) {
                    designSpace.axes[thisIndex].value = formatX(100 - thisValue);
                    scope.data.currentInstance.axes[thisIndex].value = formatX(100 - thisValue);
                } else {
                    designSpace.axes[thisIndex].value = formatX(thisValue);
                    scope.data.currentInstance.axes[thisIndex].value = formatX(thisValue);
                }

                if (type == 'two-master-handle') {
                    designSpace.axes[1].value = formatX(100 - thisValue);
                    scope.data.currentInstance.axes[1].value = formatX(100 - thisValue);
                }
                // translate axis values to metapolation ratios
                scope.getMetapolationRatios();
                scope.$apply();
            }).on('dragend', function() {
                scope.data.metapolate();
                dragActive = false;
                //d3.select(this).attr('stroke', 'none');
            });

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