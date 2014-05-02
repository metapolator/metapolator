var MARGIN = 20;

var Graph = function() {}


Graph.createCanvas = function(canvas, size) {
    var width = $($(canvas).parent()).outerWidth();

    var ratio = size.width / size.height;
    var height = Math.round(width / ratio);

    $(canvas).attr('width', width);
    $(canvas).attr('height', height);

    var ppscope = new paper.PaperScope();
    ppscope.setup(canvas);
    console.log(size);
    return new PaperJSGraph(size, ppscope);
}

Graph.resize = function(x, y, srcwidth, srcheight, destwidth, destheight) {
    var ratio = srcwidth / srcheight;
    var w, h, nx, ny;
    if (ratio >= 1) {
        w = destwidth;
        h = w / ratio;
    } else {
        h = destheight;
        w = h * ratio;
    }
    nx = w * x / srcwidth;
    ny = h * y / srcheight;
    return {x: nx, y: ny}
}


var PaperJSGraph = function(size, paperscope) {
    this.ppscope = paperscope;

    this.size = size;
    this.tool = new this.ppscope.Tool();

    this.centerlines = [];
    this.centerlinespathes = [];
    this.centercircles = [];
    this.historyPathes = [];
    this.sourcePathes = [];

    this.zpoints = [];
    this.glyphpathes = [];

    this.tool.onMouseDown = this.firedMouseDown.bind(this);
    this.tool.onMouseUp = this.firedMouseUp.bind(this);
    this.tool.onMouseDrag = this.firedMouseDrag.bind(this);

    this.dashedItems = [];
    this.label = [];
    this.items = [];

    this.tool.onMouseMove = function(event) {
        for (var k = 0; k < this.zpoints.length; k++) {
            var p = this.zpoints[k].getSegmentPoint();
            if (!this.zpoints[k].hardselected) {
                if (p.getDistance(event.point) <= 6) {
                    this.zpoints[k].markselected();
                } else {
                    this.zpoints[k].resetselected();
                }
            }
        }
    }.bind(this);

    offsetx = typeof size.offsetx == "undefined" ? 0: parseInt(size.offsetx);
    offsety = typeof size.offsety == "undefined" ? 0: parseInt(size.offsety);

    if (offsetx || offsety) {
        var point = this.getPoint(Math.abs(parseInt(offsetx)),
                                  Math.abs(parseInt(offsety)));
        this.ppscope.view.scrollBy(point);
    }
}


PaperJSGraph.prototype = {

    getElement: function() {
        return this.ppscope.getView().getElement();
    },

    getElementHeight: function() {
        return $(this.getElement()).attr('height');
    },

    firedMouseDown: function(event) {
        if (this.selectedzpoint) {
            this.selectedzpoint.resetselected();
            this.selectedzpoint = null;
        }

        for (var k = 0; k < this.zpoints.length; k++) {
            var p = this.zpoints[k].getSegmentPoint();
            if (p.getDistance(event.point) <= 6) {
                this.zpoints[k].markselected(true);
                this.selectedzpoint = this.zpoints[k];
                this.isdragged = false;
                return;
            };
        }
    },

    drawAngle: function (event) {
        var vector = substractPoint(event.point, this.selectedzpoint.zpoint);
            if (this.dirVector){
                this.dirVector.remove();
            }
            if (this.items) {
                for (var i = 0, l = this.items.length; i < l; i++) {
                    this.items[i].remove();
                }
            }
            this.dirVector = new paper.Path();
            this.dirVector.strokeColor = 'black';
            this.dirVector.moveTo(this.selectedzpoint.zpoint);
            // debugger;;
            var radius = 25, threshold = 10;
            var from = new paper.Point(radius, 0);
            var through = from.rotate(vector.angle / 2);
            var to = from.rotate(vector.angle);
            var end = addPoint(this.selectedzpoint.zpoint, to);
            this.dashedItems.push(
                new paper.Path.Line(substractPoint(this.selectedzpoint.zpoint, new paper.Point(25, 0)),
                this.selectedzpoint.zpoint));
            if (this.label) {
                var temp = addPoint(this.selectedzpoint.zpoint, through.normalize(threshold + 10));
                var text = new paper.PointText(addPoint(temp, new paper.Point(0, 3)));
                var angle = Math.floor((180 - vector.angle) * 100) / 100
                text.content = angle + '°';
                this.selectedzpoint.config.dir = (180 - vector.angle);
                text.fillColor = 'black';
                this.items.push(text);
            }
            this.dirVector.lineTo(event.point);
            for (var i = 0, l = this.dashedItems.length; i < l; i++) {
                    var item = this.dashedItems[i];
                    item.strokeColor = 'black';
                    item.dashArray = [1, 2];
                    this.items.push(item);
                }
            this.ppscope.view.draw();
    },

    firedMouseDrag: function(event) {
        if (!this.selectedzpoint) {
            var vectorX = event.delta.x > 0 ? -2 : (event.delta.x == 0 ? 0 : 2);
            var vectorY = event.delta.y > 0 ? -2 : (event.delta.y == 0 ? 0 : 2);
            this.ppscope.view.scrollBy(new this.ppscope.Point(vectorX, vectorY));
            return;
        }
        if (event.event.altKey && this.selectedzpoint) {
            this.drawAngle(event);
        } else {
            this.selectedzpoint.moveTo(event.point);

            this.selectedzpoint.moveTo(event.point);
            var selectedPoint = this.selectedzpoint;
            var changedContour = this.contours;
            var changedContourNum;
            var cordsPoint = event.point;
            var getPoint = this.getPoint.bind(this);
            $.each(changedContour, function(index, item) {
                $.each(item, function(pindex, point) {
                    if ( selectedPoint.pointText._content === point.pointname ) {
                        var newPoint = getPoint(parseInt(cordsPoint.x), parseInt(cordsPoint.y), true);
                        changedContour[index][pindex].x = parseInt(newPoint.x - 45) ;
                        changedContour[index][pindex].y = parseInt(newPoint.y + 10) ;
                        changedContourNum = index;
                    }

                })
            });
            this.deletepathes();
            this.drawcontour(changedContour[changedContourNum], 0.5, '#505055');
        }
        this.isdragged = true;
    },

    firedMouseUp: function(event) {
        if (!this.selectedzpoint)
            return;
        if (this.dirVector){
            this.dirVector.remove();
        }
        if (this.items) {
            for (var i = 0, l = this.items.length; i < l; i++) {
                this.items[i].remove();
            }
        }
        this.onMouseUp ? this.onMouseUp(this.selectedzpoint, this.isdragged) : false;
    },

    restore_original_coords: function(x, y) {
        var element = this.getElement();
        return Graph.resize(x - MARGIN, y - MARGIN, $(element).attr('width') - MARGIN * 2, $(element).attr('height') - MARGIN * 2, this.size.width, this.size.height);
    },

    getPoint: function(x, y, reverted) {
        var element = this.getElement();
        if (reverted) {
            y = this.size.height - y;
        }
        var r = Graph.resize(x, y, this.size.width, this.size.height, $(element).attr('width') - MARGIN * 2, $(element).attr('height') - MARGIN * 2);

        return new this.ppscope.Point(r.x, r.y);
    },

    showDebugLines: function(x1, y1, x2, y2, line) {


                // var from = this.getPoint(x1, y1, true);
                // from.y += +MARGIN;
                // from.x += + MARGIN;

                // var to = this.getPoint(parseInt(line[1].controls[0].x), parseInt(line[1].controls[0].y), true);
                // to.y += +MARGIN;
                // to.x += + MARGIN;

                // var ll = new this.ppscope.Path.Line(from, to);
                // ll.strokeColor = 'black';

                // var from = this.getPoint(x2, y2, true);
                // from.y += +MARGIN;
                // from.x += + MARGIN;

                // var to = this.getPoint(parseInt(line[0].controls[1].x), parseInt(line[0].controls[1].y), true);
                // to.y += +MARGIN;
                // to.x += + MARGIN;

                // var ll = new this.ppscope.Path.Line(from, to);
                // ll.strokeColor = 'black';

                var from = this.getPoint(line[0].controls[0].x, line[0].controls[0].y, true);
                from.y += +MARGIN;
                from.x += + MARGIN;

                var to = this.getPoint(parseInt(line[1].controls[1].x), parseInt(line[1].controls[1].y), true);
                to.y += +MARGIN;
                to.x += + MARGIN;

                var ll = new this.ppscope.Path.Line(from, to);
                ll.strokeColor = 'black';

                var from = this.getPoint(line[0].controls[1].x, line[0].controls[1].y, true);
                from.y += +MARGIN;
                from.x += + MARGIN;

                var to = this.getPoint(parseInt(line[1].controls[0].x), parseInt(line[1].controls[0].y), true);
                to.y += +MARGIN;
                to.x += + MARGIN;

                var ll = new this.ppscope.Path.Line(from, to);
                ll.strokeColor = 'black';
    },

    toggleCenterline: function(show) {
        this.ppscope.activate();

        if (this.centerlinespathes.length && show) {
            $(this.centerlinespathes).each(function(i, el){
                el.remove();
            });
            $(this.centercircles).each(function(i, el){
                el.remove();
            });
            this.centerlinespathes = [];
            this.centercircles = [];
            this.ppscope.view.draw();
        } else if (this.centerlinespathes.length){
            $(this.centerlinespathes).each(function(i, el){
                el.remove();
            });
            $(this.centercircles).each(function(i, el){
                el.remove();
            });
            this.centerlinespathes = [];
            this.centercircles = [];
            this.ppscope.view.draw();
            return;
        } else if (show && !this.centerlinespathes.length) {
            return;
        }

        for (var k = 0; k < this.centerlines.length; k++) {
            var centerlinepath = new this.ppscope.Path();
            centerlinepath.closed = false;
            for (v in this.centerlines[k]) {

              var line = this.centerlines[k][v];

              var x1 = parseInt(line[0].x),
                  y1 = parseInt(line[0].y),

                  x2 = parseInt(line[1].x),
                  y2 = parseInt(line[1].y),

                  Xc = parseInt(x2 - (x2 - x1) / 2),
                  Yc = parseInt(y2 - (y2 - y1) / 2);

                  // this.showDebugLines(x1, y1, x2, y2, line);

              var hInx = parseInt(line[1].controls[0].x) - (parseInt(line[1].controls[0].x) - parseInt(line[0].controls[1].x)) / 2;
              var hIny = parseInt(line[1].controls[0].y) - (parseInt(line[1].controls[0].y) - parseInt(line[0].controls[1].y)) / 2;

              var hOUTx = parseInt(line[0].controls[0].x) - (parseInt(line[0].controls[0].x) - parseInt(line[1].controls[1].x)) / 2;
              var hOUTy = parseInt(line[0].controls[0].y) - (parseInt(line[0].controls[0].y) - parseInt(line[1].controls[1].y)) / 2;

              var ppoint = this.getPoint(Xc, Yc, true);
              ppoint.y += +MARGIN;
              ppoint.x += +MARGIN;

              var handleOut = this.getPoint(hInx - Xc, Yc - hIny);
              var handleIn = this.getPoint(hOUTx - Xc, Yc - hOUTy);
              var segment = new this.ppscope.Segment(ppoint, handleIn, handleOut);

              var circle = new this.ppscope.Path.Circle({center: [ppoint.x, ppoint.y],
                                                         radius: 6, strokeColor: '#11d'});
              this.centercircles.push(circle);

              centerlinepath.add(segment);
            }
            this.centerlinespathes.push(centerlinepath);

            centerlinepath.strokeColor = '#11d';
            // centerlinepath.fullySelected = true;
        }

        this.ppscope.view.draw();
    },

    toggleHistoryPaths: function(show, prevGlyphContours){
        if (show && prevGlyphContours) {
            this.deleteHistory();
            $.each(prevGlyphContours, function(i, points){
                this.drawHistoryCountour(show, points, 0.1);
            }.bind(this));
        } else if (this.historyPathes.length) {
            this.deleteHistory();
        }
    },

    getLines: function(centerline, point) {
        var regex = /(z\d+)([lr])/;
        var match = point.pointname.match(regex);
        if (match) {
            var pointname = match[1];

            if (!centerline[pointname]) {
              centerline[pointname] = [undefined, undefined];
            }

            if (match[2] == 'r') {
              centerline[pointname][1] = point;
            } else if (match[2] == 'l') {
              centerline[pointname][0] = point;
            }
        }
    },

    drawHistoryCountour: function (show, points) {
        this.ppscope.activate();
        var element = this.getElement();

        var history = {};
        var path = new this.ppscope.Path();
        for (var k = 0; k < points.length; k++) {
            var point = points[k];
            var ppoint = this.getPoint(parseInt(point.x), parseInt(point.y), true);
            ppoint.y += +MARGIN;
            ppoint.x += +MARGIN;

            var handleIn = this.getPoint(parseInt(point.controls[0].x) - parseInt(point.x),
                                         parseInt(point.y) - parseInt(point.controls[0].y));
            var handleOut = this.getPoint(parseInt(point.controls[1].x) - parseInt(point.x),
                                          parseInt(point.y) - parseInt(point.controls[1].y));
            var segment = new this.ppscope.Segment(ppoint, handleIn, handleOut);

            path.add(segment);

            if (point.pointname) {
                // console.log(point.pointname + ' : ' + point.x + ', ' + point.y);
                this.getLines(history, point);
            }
        }
        path = this.pathColorfy(path, 0.1);
        this.ppscope.view.draw();

        this.historyPathes.push(path);
    },

    drawSourceContour: function(points){
      this.ppscope.activate();
        var element = this.getElement();

        var source = {};
        var path = new this.ppscope.Path();
        for (var k = 0; k < points.length; k++) {
            var point = points[k];
            var ppoint = this.getPoint(parseInt(point.x), parseInt(point.y), true);
            ppoint.y += +MARGIN;
            ppoint.x += +MARGIN;

            var handleIn = this.getPoint(parseInt(point.controls[0].x) - parseInt(point.x),
                                         parseInt(point.y) - parseInt(point.controls[0].y));
            var handleOut = this.getPoint(parseInt(point.controls[1].x) - parseInt(point.x),
                                          parseInt(point.y) - parseInt(point.controls[1].y));
            var segment = new this.ppscope.Segment(ppoint, handleIn, handleOut);

            path.add(segment);

            if (point.pointname) {
                // console.log(point.pointname + ' : ' + point.x + ', ' + point.y);
                this.getLines(source, point);
            }
        }
        path = this.pathColorfy(path, 0.2, '#505055');
        this.ppscope.view.draw();

        this.sourcePathes.push(path);
    },

    /*
     * Draw on canvas concrete contour.
     *
     * Parameters:
     * points - array of contour points in json format
     *   {x: N, y: M, controls: [{x: K, y: L}, {x: G, y: H}]}
     */
    drawcontour: function(points, alpha, color) {
        this.ppscope.activate();
        var element = this.getElement();

        var centerlines = {};

        var path = new this.ppscope.Path();
        for (var k = 0; k < points.length; k++) {
            var point = points[k];

            var ppoint = this.getPoint(parseInt(point.x), parseInt(point.y), true);
            ppoint.y += +MARGIN;
            ppoint.x += +MARGIN;

            var handleIn = this.getPoint(parseInt(point.controls[0].x) - parseInt(point.x),
                                         parseInt(point.y) - parseInt(point.controls[0].y));
            var handleOut = this.getPoint(parseInt(point.controls[1].x) - parseInt(point.x),
                                          parseInt(point.y) - parseInt(point.controls[1].y));
            var segment = new this.ppscope.Segment(ppoint, handleIn, handleOut);

            path.add(segment);

            if (point.pointname) {
                // console.log(point.pointname + ' : ' + point.x + ', ' + point.y);
                this.getLines(centerlines, point);
            }
        }
        path = this.pathColorfy(path, alpha, color);
        this.ppscope.view.draw();

        this.glyphpathes.push(path);
        return centerlines;
    },

    pathColorfy: function(path, alpha, color){
        if (color !== undefined) {
            path.fillColor = color;
        } else {
            path.fillColor = 'red';
            path.fillColor.hue =  360 * Math.random();
            path.fillColor.saturation = 1;
            path.fillColor.brightness = 1;
        }
        path.fillColor.alpha = (alpha !== undefined)? alpha : 0.5;

        path.closed = true;
        path.strokeColor = new this.ppscope.Color(0.5, 0, 0.5);
        // path.fullySelected = true;
        return path;
    },

    setPointByName: function(point) {
        this.ppscope.activate();

        this.selectedzpoint = point;
        this.isdragged = false;

        this.ppscope.view.draw();
    },

    /*
     * Draw z-point in canvas
     *
     * Parameters:
     * point - concrete point in json format {x: N, y: M, iszpoint: boolean}
     */
    drawpoint: function(point) {
        if ( !point.iszpoint )
            return;

        this.ppscope.activate();

        // console.log(point.data.pointname + ' : ' + point.x + ', ' + point.y);

        var zpoint = this.getPoint(parseInt(point.x), parseInt(point.y), true);
        zpoint.y += +MARGIN;
        zpoint.x += +MARGIN;

        var point = new Point(this.ppscope, zpoint, point.data);
        this.zpoints.push(point);

        this.ppscope.view.draw();
        return point;
    },


    deletepoints: function() {
        $(this.zpoints).each(function(i, el){
            el.remove();
        });
        delete this.zpoints;
        this.zpoints = [];
    },

    deleteSource: function() {
        $(this.sourcePathes).each(function(i, el){
            el.remove();
        });
        delete this.sourcePathes;
        this.sourcePathes = [];
        this.ppscope.view.draw();
    },


    deletepathes: function() {
        $(this.glyphpathes).each(function(i, el) {
            el.remove();
        });

        delete this.glyphpathes;
        this.glyphpathes = [];
    },

    deleteHistory: function() {
        $(this.historyPathes).each(function(i, el){
            el.remove();
        });

        this.historyPathes = [];
        this.ppscope.view.draw();
    },
}


function Point(ppscope, zpoint, pointpreset) {
    this.large_circle = new ppscope.Path.Circle({center: [zpoint.x, zpoint.y],
                                                 radius: 6, strokeColor: 'blue'});
    this.point_circle = new ppscope.Path.Circle({center: [zpoint.x, zpoint.y],
                                                 radius: 3, strokeColor: 'red'});
    this.pointText = new ppscope.PointText({point: [zpoint.x, zpoint.y - 8]});
    this.pointText.justification = 'center';
    this.pointText.fillColor = 'blue';
    this.pointText.content = pointpreset.pointname;

    this.config = pointpreset;

    this.zpoint = zpoint;

    this.large_circle.strokeColor.alpha = 0.5;
    this.point_circle.strokeColor.alpha = 0.5;
    this.pointText.fillColor.alpha = 0.5;

}

Point.prototype.getSegmentPoint = function() {
    return this.zpoint;
}

Point.prototype.moveTo = function(point) {
    this.pointText.point.x = point.x;
    this.pointText.point.y = point.y - 8;

    this.zpoint.x = parseInt(point.x);
    this.zpoint.y = parseInt(point.y);

    this.point_circle.position = point;
    this.large_circle.position = point;
}

Point.prototype.markselected = function(hardselected) {
    this.point_circle.fillColor = 'black';
    this.point_circle.fillColor.alpha = 0.5;
    this.point_circle.fillColor.strokeWidth = 2;
    this.hardselected = hardselected;
}


Point.prototype.resetselected = function() {
    this.point_circle.fillColor = 'white';
    this.point_circle.fillColor.alpha = 0.1;
    this.point_circle.fillColor.strokeWidth = 1;
    this.hardselected = false;
}

Point.prototype.remove = function() {
    this.large_circle.remove();
    this.point_circle.remove();
    this.pointText.remove();
}


var Glyph = function(view, glyphsize) {
    this.graph = new Graph();

    this.view = view;
    this.canvas = view.getDrawing();

    // To use two.js just implement Graph interface
    // with all functions that will provide needed
    // functional, and replace this line with method of
    // Graph Factory
    this.graph = Graph.createCanvas(this.canvas, glyphsize);
    this.graph.onMouseUp = this.onMouseUp.bind(this);

    this.view.afterPointChanged = this.pointSelect.bind(this);
    this.view.onPointParamSubmit = this.pointFormSubmit.bind(this);
}


Glyph.prototype = {

    toggleCenterline: function(show) {
        this.graph.toggleCenterline(show);
    },

    toggleHistoryPaths: function(show, cont) {
        this.graph.history = show;
        if (!cont) {
            this.graph.toggleHistoryPaths(show, this.pastGlyphControus);
        } else {
            this.graph.toggleHistoryPaths(show, this.prevGlyphContours);
        }
    },

    getZPointByName: function(pointname) {
        var points = this.graph.zpoints.filter(function(point){
            return point.config.pointname == pointname;
        });
        if (!points.length)
            return;
        return points[0];
    },

    renderSource: function(contours) {
        this.graph.deleteSource();

        for (var i = 0; i < contours.length; i++) {
            this.graph.drawSourceContour(contours[i]);
        }
    },

    render: function(contours) {
        this.graph.deletepathes();

        this.pastGlyphControus = this.prevGlyphContours;
        this.prevGlyphContours = contours;
        this.graph.contours = contours;
        this.graph.centerlines = [];
        for (var k = 0; k < contours.length; k++) {
            this.graph.centerlines.push(
                this.graph.drawcontour(contours[k]));
        }
    },

    renderZPoints: function(points) {
        if (!points) {
            return;
        }
        this.graph.deletepoints();
        for (var k = 0; k < points.length; k++) {
            var point = this.graph.drawpoint(points[k]);
            if (point) {
                this.view.addPointToOption(point);
            }
        }
    },

    pointSelect: function(point) {
        this.graph.setPointByName(point);
    },

    pointFormSubmit: function(point, isdragged) {
        var xycoord = this.graph.restore_original_coords(point.zpoint.x, point.zpoint.y);

        var data = {
            x: parseInt(xycoord.x),
            y: this.graph.size.height - Math.round(xycoord.y),
            data: point.config
        };
        if (!isdragged) {
            this.pointSelect(point);
        }

        this.onZPointChanged && this.onZPointChanged(this, data);
    },

    onMouseUp: function(point, isdragged) {
        if (isdragged) {
            this.pointFormSubmit(point, isdragged);
        }
        this.view.setPointFormValues(point);
    }

}

function addPoint (ps, pe) {
    return new paper.Point(ps.x + pe.x, ps.y + pe.y);
}

function substractPoint (ps, pe) {
    return new paper.Point(ps.x - pe.x, ps.y - pe.y);
}
