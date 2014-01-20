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

    this.zpoints = [];
    this.glyphpathes = [];

    this.tool.onMouseDown = this.firedMouseDown.bind(this);
    this.tool.onMouseUp = this.firedMouseUp.bind(this);
    this.tool.onMouseDrag = this.firedMouseDrag.bind(this);

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

    firedMouseDrag: function(event) {
        if (!this.selectedzpoint) {
            var vectorX = event.delta.x > 0 ? -2 : (event.delta.x == 0 ? 0 : 2);
            var vectorY = event.delta.y > 0 ? -2 : (event.delta.y == 0 ? 0 : 2);
            this.ppscope.view.scrollBy(new this.ppscope.Point(vectorX, vectorY));
            return;
        }
        this.selectedzpoint.moveTo(event.point);
        this.isdragged = true;
    },

    firedMouseUp: function(event) {
        if (!this.selectedzpoint) 
            return;

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

    /*
     * Draw on canvas concrete contour.
     * 
     * Parameters:
     * points - array of contour points in json format
     *   {x: N, y: M, controls: [{x: K, y: L}, {x: G, y: H}]}
     */
    drawcontour: function(points) {
        this.ppscope.activate();
        var element = this.getElement();

        var path = new this.ppscope.Path();
        for (var k = 0; k < points.length; k++) {
            var point = points[k];
            var ppoint = this.getPoint(parseInt(point.x), parseInt(point.y), true);
            ppoint.y += +MARGIN;
            ppoint.x += + MARGIN;

            var handleIn = this.getPoint(parseInt(point.controls[0].x) - parseInt(point.x),
                                         parseInt(point.y) - parseInt(point.controls[0].y));
            var handleOut = this.getPoint(parseInt(point.controls[1].x) - parseInt(point.x),
                                          parseInt(point.y) - parseInt(point.controls[1].y));
            var segment = new this.ppscope.Segment(ppoint, handleIn, handleOut);

            path.add(segment);
        }
        path.fillColor = {
            hue: 360 * Math.random(),
            saturation: 1,
            brightness: 1,
            alpha: 0.5
        };
        path.closed = true;
        path.strokeColor = new this.ppscope.Color(0.5, 0, 0.5);
        this.ppscope.view.draw();

        this.glyphpathes.push(path);
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
            el.segment.path.remove();
        });

        delete this.zpoints;
        this.zpoints = [];
    },


    deletepathes: function() {
        $(this.glyphpathes).each(function(i, el) {
            el.remove();
        });

        delete this.glyphpathes;
        this.glyphpathes = [];
    }

}


function Point(ppscope, zpoint, pointpreset) {
    this.large_circle = new ppscope.Path.Circle({center: [zpoint.x, zpoint.y],
                                                 radius: 6, strokeColor: 'black'});
    this.point_circle = new ppscope.Path.Circle({center: [zpoint.x, zpoint.y],
                                                 radius: 2, fillColor: 'black'});
    this.pointText = new ppscope.PointText({point: [zpoint.x, zpoint.y - 8]});
    this.pointText.justification = 'center';
    this.pointText.fillColor = 'black';
    this.pointText.content = pointpreset.pointname;

    this.config = pointpreset;

    this.zpoint = zpoint;
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
    this.large_circle.fillColor = 'gray';
    this.hardselected = hardselected;
}


Point.prototype.resetselected = function() {
    this.large_circle.fillColor = 'white';
    this.hardselected = false;
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

    getZPointByName: function(pointname) {
        var points = this.graph.zpoints.filter(function(point){
            return point.config.pointname == pointname;
        });
        if (!points.length)
            return;
        return points[0];
    },

    render: function(contours) {
        this.graph.deletepathes();
        for (var k = 0; k < contours.length; k++) {
            this.graph.drawcontour(contours[k]);
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
