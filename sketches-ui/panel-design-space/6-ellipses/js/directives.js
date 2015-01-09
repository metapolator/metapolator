app.directive('explore', ['$document',
function($document) {
    return {
        restrict : 'E',
        link : function(scope, element, attrs, ctrl) {
            var data = scope.selectedDesignSpaces;
            var svg = d3.select(element[0]).append('svg').style({
                'width' : '100%',
                'height' : '100%'
            });
            // we need 2 layers, so the masters are allways on top of the ellipses
            var layer2 = svg.append('g');
            var layer1 = svg.append('g');

            // watch for data changes and re-render
            scope.$watch('selectedDesignSpaces.masters.length', function(newVals, oldVals) {
                return scope.render();
            }, true);


            // (RE-)RENDER
            scope.render = function() {
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
                    d3.select('#label-' + thisIndex).attr('x', d3.event.x).attr('y', d3.event.y); //select corresponding label
                    // update scope and redraw ellipses
                    data.masters[thisIndex].coordinates = [d3.event.x, d3.event.y];
                    drawEllipses();
                    scope.$apply();
                }).on('dragend', function() {
                    // dragstop
                    d3.select(this).attr('stroke', 'none');
                });

                // initial drawing of ellipses
                drawEllipses();

                // create masters
                layer1.selectAll('circle').data(data.masters).enter().append('circle').attr('r', 16).attr('fill', '#000').attr('cx', function(d) {
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
                    return d.coordinates[1];
                }).text(function(d) {
                    return d.master.name;
                }).attr("font-size", "10px").attr("text-anchor", "middle").attr("font-size", "8px").attr("fill", "#fff").attr("id", function(d, i) {
                    return "label-" + i;
                }).attr("class", "unselectable");
            }
            
            
            drawEllipses = function () {
                layer2.selectAll('ellipse').remove();
                
                // pythagoras
                function getDistance(a1, a2, b1, b2) {
                    var c = Math.sqrt(Math.pow((a1 - a2), 2) + Math.pow((b1 - b2), 2));
                    return c;
                }
                // get nr of masters
                var dataLength = data.masters.length;
                // color range for fields
                var color = d3.scale.linear().domain([0, (dataLength - 1) / 3, (dataLength - 1) * 2 / 3, dataLength - 1]).range(["#f00", "#ff0", "#0f0", "#00f"]); 
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
                        return a[1] - b[1]
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
                    var ry = yDeriv / ( Math.sin(Math.acos(xDeriv / disanceToSecond)) ); // ry is second radius of ellipse

                    // find angle of second to this (for css rotating ellipse later, because svg cant draw a rotated ellipse itself)
                    var dx = data.masters[second].coordinates[0] - thisX;
                    var dy = data.masters[second].coordinates[1] - thisY;
                    var secondAngle = Math.floor(Math.atan2(dy, dx) * 180 / Math.PI);
                    /*
                    if (i == 0) {
                        console.clear();
                        console.log(data.masters[i].master.name);
                        console.log("closest: " + data.masters[closest].master.name + " " + Math.floor(distanceToClosest) + "px");
                        console.log("second (long axis of ellipse): " + data.masters[second].master.name + " " + Math.floor(disanceToSecond) + "px");
                        console.log(data.masters[closest].master.name + " to " + data.masters[second].master.name + " : " + Math.floor(distanceClosestToSecond) + "px");
                        console.log("xDeriv(" + data.masters[closest].master.name + " to " + data.masters[i].master.name + "): " + Math.floor(xDeriv) + "px");
                        console.log("yDeriv(" + data.masters[closest].master.name + " to " + data.masters[i].master.name + "): " + Math.floor(yDeriv) + "px");
                        console.log("ry (short axis of ellipse): " + Math.floor(ry) + "px");
                    }*/
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
                    return "rotate(" + ellipses[i][2] + ", " + d.coordinates[0] + ", " + d.coordinates[1] + ")"
                }).style("opacity", 0.3);
            }   
        }
    }
}]);
