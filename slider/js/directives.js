app.directive('sizeRope', ['$document',
function($document) {
    return {
        restrict : 'E',
        link : function(scope, element, attrs, ctrl) {
            var templayer = '<div id="templayer" style="position: fixed; left: 0; top: 0; width: 100%; height: 100%; z-index: 10000;"></div>';
            var svg = d3.select(element[0]).append('svg').attr('width', '16px').attr('height','16px');
            var svgT;
            var gT;
            var lineT;
            var diamondT;
            var screenX;
            var screenY;
            var fontsize;
            var diamondSize = 8;

            //drag behaviour
            var drag = d3.behavior.drag().on('dragstart', function() {
                fontsize = scope.fontSize;
                // create a temp layer
                $(document.body).append(templayer);
                svgT = d3.select("#templayer").append('svg').attr('width', '100%').attr('height','100%');
                screenX = $(element[0]).offset().left;
                screenY = $(element[0]).offset().top;
                gT = svgT.append('g');
                diamondT = svgT.append('g').attr('transform', 'translate(' + screenX + ',' + screenY + ')').append('polygon').attr('fill', '#000').attr('points', '8,0 16,8 8,16 0,8').style('fill', '#F85C37');
             
            }).on('drag', function() {
                var x = d3.event.x - diamondSize;
                var y = d3.event.y - diamondSize;
                var originX = screenX + diamondSize;
                var originY = screenY + diamondSize;
                diamondT.attr('transform', 'translate(' + x + ',' + y + ')');
                gT.selectAll('*').remove();
                lineT = gT.append('line').attr('x1', originX).attr('y1', originY).attr('x2', (d3.event.x + screenX)).attr('y2', (d3.event.y + screenY)).style('stroke', '#000').style('stroke-width', '2');
                scope.fontSize = getSize(fontsize, screenX, screenY, x, -y);
                scope.$apply();   
            }).on('dragend', function() {
                $("#templayer").remove();
            });

            // create static diamond
            var diamond = svg.append('g').call(drag);
            diamond.append('polygon').attr('fill', '#000').attr('points', '8,0 16,8 8,16 0,8').style('fill', '#F85C37');

            // calculate size increase
            function getSize(current, originX, originY, xPosition, yPosition){                
                if ((xPosition >= 0 && yPosition >= 0) || xPosition <= 0 && yPosition <= 0) {
                    var growth = Math.floor(Math.sqrt(Math.pow(xPosition, 2) + Math.pow(yPosition, 2)));
                    if (yPosition < 0) {
                        growth *= -1;
                    }
                    var newSize = current + growth;
                    if (newSize < 10) {
                        newSize = 10;
                    }
                    
                } else {
                    var newSize = current;
                }
                return newSize;
            }
        }
    };
}]);

app.directive('arrow', function($document) {
    return {
        restrict : 'E',
        link : function(scope, element, attrs, ctrl) {
            element.bind('click', function(e) {
                //var childBranche = element.parent().parent().find("> .inspector-branche")
                //childBranche.toggle();
                //element.toggleClass("open");
            });
        }
    };
});

app.directive('control', ['$document',
function($document) {
    return {
        restrict : 'E',
        link : function(scope, element, attrs, ctrl) {
            var svg = d3.select(element[0]).append('svg');
            var paddingLeft = 50;
            var paddingTop = 30;
            var axisWidth = 200;
            var paddingLabel = 25;
            var axisDistance = 50;
            var axisTab = 10;
            var axisTabLeft = 60;
            var indentRight = 20;
            var indentLeft = 40;
            var dragActive = false;

            // watch for data changes and re-render
            scope.$watchCollection('[data.designSpaces[data.currentDesignSpace].masters.length, data.designSpaces[data.currentDesignSpace].masters.length, data.designSpaces[data.currentDesignSpace].masters[0], data.designSpaces[data.currentDesignSpace].triangle, data.currentDesignSpace]', function(newVals, oldVals, scope) {
                return scope.render();
            }, true);
            scope.$watch('data.designSpaces[data.currentDesignSpace].axes', function(newVal) {
                if (!dragActive) {
                    return scope.render();
                }
            }, true);

            // (RE-)RENDER
            scope.render = function() {
                var data = scope.data.designSpaces[scope.data.currentDesignSpace];

                // remove all previous items before render
                svg.selectAll('*').remove();

                // 1 master in Design Space
                if (data.masters.length == 1) {
                    // create axes
                    svg.append('path').attr('class', 'slider-axis').attr('d', 'M' + paddingLeft + ' ' + (paddingTop + axisTab) + ' L' + paddingLeft + ' ' + paddingTop + ' L' + (paddingLeft + axisWidth) + ' ' + paddingTop + ' L' + (paddingLeft + axisWidth) + ' ' + (paddingTop + axisTab)).attr('fill', 'none');
                    // create  label
                    svg.append('text').attr('class', 'label-left slider-label').attr('x', paddingLeft - indentLeft).attr('y', paddingTop + paddingLabel).text(function() {
                        return data.masters[0].master.name;
                    });
                    svg.append('text').attr('class', 'label-right-inactive slider-label').attr('x', paddingLeft + axisWidth - indentRight).attr('y', paddingTop + paddingLabel).text("Just one more...");
                }

                // Triangle view
                else if (data.axes.length == 2 && data.triangle == true) {

                    // pythagoras
                    function getDistance(a1, a2, b1, b2) {
                        var c = Math.sqrt(Math.pow((a1 - a2), 2) + Math.pow((b1 - b2), 2));
                        return c;
                    }

                    //drag behaviour
                    var drag = d3.behavior.drag().on('dragstart', function() {
                        d3.select(this).attr('stroke', '#f85c37').attr('stroke-width', '4');
                        dragActive = true;
                    }).on('drag', function() {

                        d3.select(this).attr('cx', d3.event.x).attr('cy', d3.event.y);
                        var lengthA = getDistance(d3.event.x, 183, d3.event.y, 10) + 1;
                        var lengthB = getDistance(d3.event.x, 183, d3.event.y, 210) + 1;
                        var lengthC = getDistance(d3.event.x, 10, d3.event.y, 110) + 1;
                        var ratioAtoB = Math.floor((1 / lengthB) / (1 / lengthA + 1 / lengthB) * 100);
                        var ratioBtoC = Math.floor((1 / lengthC) / (1 / lengthB + 1 / lengthC) * 100);
                        data.axes[0].value = ratioAtoB;
                        data.axes[1].value = ratioBtoC;
                        scope.$apply();
                    }).on('dragend', function() {
                        dragActive = false;
                        d3.select(this).attr('stroke', 'none');
                    });

                    // create triangle and slider
                    svg.append('polygon').attr('points', '183, 10 183, 210 10, 110').attr('style', 'stroke: #000; stroke-width: 1; fill: none');
                    svg.append('circle').attr('fill', '#000').attr('cx', function(d) {
                        return 120;
                    }).attr('cy', function(d) {
                        return 110;
                    }).attr('index', function(d, i) {
                        return i;
                    }).attr('r', 12).style("cursor", "pointer").call(drag);
                }

                // All other cases
                else if (data.masters.length > 0) {
                    // create drag events
                    var drag = d3.behavior.drag().on('dragstart', function() {
                        dragActive = true;
                        d3.select(this).attr('stroke', '#f85c37').attr('stroke-width', '4');
                    }).on('drag', function() {
                        d3.select(this).attr('cx', limitX(d3.event.x));
                        // update scope and redraw ellipses
                        var thisIndex = d3.select(this).attr('index');
                        var thisValue = (limitX(d3.event.x) - indentLeft) / (axisWidth / 100);
                        data.axes[thisIndex].value = thisValue;
                        //d3.select("#output-label-" + thisIndex).text(thisValue.toFixed(1) + "%");
                        // get ratios
                        scope.getMetapolationRatios(data);
                        scope.$apply();
                    }).on('dragend', function() {
                        dragActive = false;
                        d3.select(this).attr('stroke', 'none');
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

                    // create slider containers
                    var axes = svg.selectAll('g').data(data.axes).enter().append('g').attr('transform', function(d, i) {
                        var x = paddingLeft - indentLeft;
                        var y = i * axisDistance + paddingTop;
                        return "translate(" + x + "," + y + ")";
                    }).attr('class', 'slider-container');

                    // append axis itself
                    axes.append('path').attr('d', function(d, i) {
                        // prevent last axis from having the vertical offset
                        if (i != (data.axes.length - 1)) {
                            var offset = 1;
                        } else {
                            var offset = 0;
                        }
                        return 'M' + indentLeft + ' ' + (axisTab + offset * axisTabLeft) + ' L' + indentLeft + ' 0  L' + (indentLeft + axisWidth) + ' 0 L' + (indentLeft + axisWidth) + ' ' + axisTab;
                    }).attr('class', 'slider-axis');

                    // append slider handles
                    axes.append('circle').attr('r', 8).attr('cx', function(d) {
                        return d.value * (axisWidth / 100) + indentLeft;
                    }).attr('cy', '0').attr('index', function(d, i) {
                        return i;
                    }).attr('class', 'slider-handle').call(drag);

                    // create output label
                    /*
                    axes.append('text').attr('x', (indent + (0.5 * axisWidth))).attr('y', paddingLabel).text(function(d, i) {
                    return data.axes[i].value.toFixed(1) + '%';
                    }).attr("id", function(d, i) {
                    return "output-label-" + i;
                    }).attr('class', 'slider-label-output slider-label');
                    */

                    // create left label
                    if (data.masters.length < 3) {
                        svg.append('text').attr('x', paddingLeft - indentLeft).attr('y', (paddingTop + paddingLabel + (data.axes.length - 1) * axisDistance)).text(data.masters[0].master.name).attr('class', 'slider-label-left slider-label');
                    }

                    // create rigth label
                    var rightlabels = axes.append('g').attr('transform', function(d, i) {
                        var x = indentLeft + axisWidth - indentRight;
                        var y = paddingLabel;
                        return "translate(" + x + "," + y + ")";
                    }).attr('class', 'slider-label-right-container');

                    rightlabels.append('rect').attr('x', '0').attr('y', '-15').attr('width', '100').attr('height', '20').attr('fill', '#fff').attr('class', 'slider-hover-square');

                    rightlabels.append('text').text(function(d, i) {
                        return data.masters[i + 1].master.name;
                    }).attr('class', 'slider-label-right slider-label');

                    rightlabels.append('text').attr('x', '80').attr('y', '2').text("o").attr('masterid', function(d, i) {
                        return i;
                    }).attr('class', 'slider-button slider-remove-master').on("click", function(d, i) {
                        scope.removeMaster(i + 1);
                    });

                    scope.getMetapolationRatios(data);
                }
            }
        }
    };
}]);

app.directive('explore', ['$document',
function($document) {
    return {
        restrict : 'E',
        link : function(scope, element, attrs, ctrl) {
            var svg = d3.select(element[0]).append('svg');
            // we need 2 layers, so the masters are allways on top of the ellipses
            var layer2 = svg.append('g');
            var layer1 = svg.append('g');

            // watch for data changes and re-render
            scope.$watchCollection('[data.designSpaces[data.currentDesignSpace].masters.length, data.currentDesignSpace]', function(newVals, oldVals, scope) {
                return scope.render();
            }, true);

            // (RE-)RENDER
            scope.render = function() {
                var data = scope.data.designSpaces[scope.data.currentDesignSpace];
                // remove all previous items before render
                layer2.selectAll('*').remove();
                layer1.selectAll('*').remove();

                // create drag events
                var drag = d3.behavior.drag().on('dragstart', function() {
                    // dragstart
                    d3.select(this).attr('stroke', '#fff').attr('stroke-width', '4');
                }).on('drag', function() {
                    d3.select(this).attr('cx', d3.event.x).attr('cy', d3.event.y);
                    var thisIndex = d3.select(this).attr('index');
                    d3.select('#label-' + thisIndex).attr('x', d3.event.x).attr('y', d3.event.y + 25);
                    //select corresponding label
                    // update scope and redraw ellipses
                    data.masters[thisIndex].coordinates = [d3.event.x, d3.event.y];
                    drawEllipses(data);
                    scope.$apply();
                }).on('dragend', function() {
                    // dragstop
                    d3.select(this).attr('stroke', 'none');
                });

                // initial drawing of ellipses
                drawEllipses(data);

                // create masters
                layer1.selectAll('circle').data(data.masters).enter().append('circle').attr('r', 12).attr('fill', '#000').attr('cx', function(d) {
                    return d.coordinates[0];
                }).attr('cy', function(d) {
                    return d.coordinates[1];
                }).attr('index', function(d, i) {
                    return i;
                }).style("cursor", "pointer").call(drag);

                // create labels
                layer1.selectAll('text').data(data.masters).enter().append('text').attr('x', function(d) {
                    return d.coordinates[0];
                }).attr('y', function(d) {
                    return d.coordinates[1] + 25;
                }).text(function(d) {
                    return d.master.name;
                }).attr("font-size", "10px").attr("text-anchor", "middle").attr("font-size", "8px").attr("fill", "#fff").attr("id", function(d, i) {
                    return "label-" + i;
                }).attr("class", "unselectable");
            };
            drawEllipses = function(data) {
                layer2.selectAll('ellipse').remove();
                layer2.selectAll('circle').remove();

                // get nr of masters
                var dataLength = data.masters.length;
                // color range for fields
                var color = d3.scale.linear().domain([0, (dataLength - 1) / 3, (dataLength - 1) * 2 / 3, dataLength - 1]).range(["#f00", "#ff0", "#0f0", "#00f"]);

                // pythagoras
                function getDistance(a1, a2, b1, b2) {
                    var c = Math.sqrt(Math.pow((a1 - a2), 2) + Math.pow((b1 - b2), 2));
                    return c;
                }

                // only one master: big circle
                if (data.masters.length == 1) {
                    layer2.selectAll('circle').data(data.masters).enter().append('circle').attr('r', 100).attr('fill', '#f00').attr('cx', function(d) {
                        return d.coordinates[0];
                    }).attr('cy', function(d) {
                        return d.coordinates[1];
                    }).style("opacity", 0.3);
                }

                // two masters: two circles
                else if (data.masters.length == 2) {
                    var distanceTwo = getDistance(data.masters[0].coordinates[0], data.masters[1].coordinates[0], data.masters[0].coordinates[1], data.masters[1].coordinates[1]);
                    layer2.selectAll('circle').data(data.masters).enter().append('circle').attr('r', distanceTwo).attr('fill', function(d, i) {
                        return color(i);
                    }).attr('cx', function(d) {
                        return d.coordinates[0];
                    }).attr('cy', function(d) {
                        return d.coordinates[1];
                    }).style("opacity", 0.3);
                }

                // all other cases
                else if (data.masters.length > 2) {
                    // ellipses array
                    var ellipses = new Array();

                    for (var i = 0; i < dataLength; i++) {
                        // make array of distances to each other master
                        var distanceArray = new Array();
                        var thisX = data.masters[i].coordinates[0];
                        var thisY = data.masters[i].coordinates[1];
                        for (var j = 0; j < data.masters.length; j++) {
                            if (j != i) {
                                otherX = data.masters[j].coordinates[0];
                                otherY = data.masters[j].coordinates[1];
                                var distance = getDistance(otherX, thisX, otherY, thisY);
                                distanceArray[j] = new Array(j, distance);
                            }
                        }
                        distanceArray.sort(function(a, b) {
                            return a[1] - b[1];
                        });
                        // find closest and second closest
                        var closest = distanceArray[0][0];
                        var distanceToClosest = distanceArray[0][1];
                        var second = distanceArray[1][0];
                        var disanceToSecond = distanceArray[1][1];

                        // get x and y of point closest in rotated field (x-axis is the line from this to second closest)
                        var distanceClosestToSecond = getDistance(data.masters[closest].coordinates[0], data.masters[second].coordinates[0], data.masters[closest].coordinates[1], data.masters[second].coordinates[1]);
                        var h = distanceClosestToSecond;
                        var c = disanceToSecond;
                        var d = distanceToClosest;
                        var yDeriv = Math.floor(Math.sqrt(-1 * Math.pow(((-Math.pow(d, 2) + Math.pow(h, 2) + Math.pow(c, 2) ) / (2 * c)), 2) + Math.pow(h, 2)));
                        var xDeriv = Math.floor(Math.sqrt(Math.pow(d, 2) - Math.pow(yDeriv, 2)));
                        var ry = yDeriv / ( Math.sin(Math.acos(xDeriv / disanceToSecond)) );
                        // ry is second radius of ellipse

                        // find angle of second to this (for css rotating ellipse later, because svg cant draw a rotated ellipse itself)
                        var dx = data.masters[second].coordinates[0] - thisX;
                        var dy = data.masters[second].coordinates[1] - thisY;
                        var secondAngle = Math.floor(Math.atan2(dy, dx) * 180 / Math.PI);
                        /* if (i == 0) { console.clear(); console.log(data.masters[i].master.name); console.log("closest: " + data.masters[closest].master.name + " " + Math.floor(distanceToClosest) + "px"); console.log("second (long axis of ellipse): " + data.masters[second].master.name + " " + Math.floor(disanceToSecond) + "px"); console.log(data.masters[closest].master.name + " to " + data.masters[second].master.name + " : " + Math.floor(distanceClosestToSecond) + "px"); console.log("xDeriv(" + data.masters[closest].master.name + " to " + data.masters[i].master.name + "): " + Math.floor(xDeriv) + "px"); console.log("yDeriv(" + data.masters[closest].master.name + " to " + data.masters[i].master.name + "): " + Math.floor(yDeriv) + "px"); console.log("ry (short axis of ellipse): " + Math.floor(ry) + "px");}*/
                        ellipses[i] = new Array(disanceToSecond, ry, secondAngle);
                    }

                    // draw ellipses
                    layer2.selectAll('ellipse').data(data.masters).enter().append('ellipse').attr('rx', function(d, i) {
                        return ellipses[i][0];
                    }).attr('ry', function(d, i) {
                        return ellipses[i][1];
                    }).attr('fill', function(d, i) {
                        return color(i);
                    }).attr('cx', function(d) {
                        return d.coordinates[0];
                    }).attr('cy', function(d) {
                        return d.coordinates[1];
                    }).attr("transform", function(d, i) {
                        return "rotate(" + ellipses[i][2] + ", " + d.coordinates[0] + ", " + d.coordinates[1] + ")";
                    }).style("opacity", 0.3);
                }
            };
        }
    };
}]);

