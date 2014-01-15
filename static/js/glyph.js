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
        this.ppscope.project.activeLayer.selected = false;
        if (event.item) {
            event.item.selected = true;
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
        this.selectedzpoint = null;
        for (var k = 0; k < this.zpoints.length; k++) {
            var p = this.zpoints[k].segment.point;
            if (p.getDistance(event.point) < 5) {
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
        this.selectedzpoint.segment.path.position = event.point;
        this.selectedzpoint.label.point = event.point;
        this.isdragged = true;
    },

    firedMouseUp: function(event) {
        if (!this.selectedzpoint) 
            return;

        var pointdata = {x: event.point.x, y: event.point.y, data: this.selectedzpoint.data};
        this.onMouseUp ? this.onMouseUp(event.event, this.isdragged, pointdata) : false;
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
            var ppoint = this.getPoint(Number(point.x), Number(point.y), true);
            ppoint.y += +MARGIN;
            ppoint.x += + MARGIN;

            var handleIn = this.getPoint(Number(point.controls[0].x) - Number(point.x),
                                         Number(point.y) - Number(point.controls[0].y));
            var handleOut = this.getPoint(Number(point.controls[1].x) - Number(point.x),
                                          Number(point.y) - Number(point.controls[1].y));
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

    setPointByName: function(x, y, pointname, data) {
        this.ppscope.activate();
        for (var k = 0; k < this.zpoints.length; k++) {
            if (this.zpoints[k].data.pointname == pointname) {
                this.zpoints[k].data = data;

                this.selectedzpoint = this.zpoints[k];
                this.selectedzpoint.segment.path.position = new this.ppscope.Point(x, y);
                this.selectedzpoint.label.point = new this.ppscope.Point(x, y);
                this.isdragged = false;
                return;
            }
        }
        this.ppscope.view.draw();
    },

    getElementPoint: function(zpoint) {
        var gpath = new this.ppscope.Path.Rectangle(zpoint, 1);
        gpath.strokeColor = 'green';
        gpath.closed = true;
        gpath.selected = true;
        return gpath.segments[0];
    },

    getPointLabel: function(zpoint, pointname) {
        var text = new this.ppscope.PointText(zpoint);
        text.justification = 'center';
        text.fillColor = 'black';
        text.content = pointname;
        return text;
    },

    /*
     * Draw z-point in canvas
     * 
     * Parameters:
     * point - concrete point in json format {x: N, y: M, iszpoint: boolean}
     */
    drawpoint: function(point) {
        this.ppscope.activate();
        
        if ( !point.iszpoint )
            return;

        var element = this.getElement();
        var zpoint = this.getPoint(Number(point.x), Number(point.y), true);
        zpoint.y += +MARGIN;
        zpoint.x += +MARGIN;

        var spoint = this.getElementPoint(zpoint);
        var text = this.getPointLabel(zpoint, point.data.pointname);

        this.zpoints.push({segment: spoint, data: point.data, label: text});

        this.ppscope.view.draw();
        return {x: Math.round(zpoint.x), y: Math.round(zpoint.y), data: point.data};
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


var Glyph = function(view, glyphsize) {
    this.graph = new Graph();

    this.view = view;
    this.canvas = view.getDrawing();

    // To use two.js just implement Graph interface
    // with all functions that will provide needed
    // functional, and replace this line with method of
    // Graph Factory
    this.graph = Graph.createCanvas(this.canvas, glyphsize);

    this.graph.onMouseDown = this.onMouseDown.bind(this);
    this.graph.onMouseUp = this.onMouseUp.bind(this);
    this.graph.onMouseDrag = this.onMouseDrag.bind(this);

    this.view.afterPointChanged = this.pointChanged.bind(this);
    this.view.onPointParamSubmit = this.pointFormSubmit.bind(this);
}


Glyph.prototype = {

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

    pointChanged: function(data) {
        this.graph.setPointByName(Math.round(data.x), Math.round(data.y),
                                  data.data.pointname, data.data);
    },

    pointFormSubmit: function(pointform_data, isdragged) {
        var xycoord = this.graph.restore_original_coords(pointform_data.x, pointform_data.y);

        var element = this.graph.getElement();

        var data = {
            x: Math.round(xycoord.x),
            y: this.graph.size.height - Math.round(xycoord.y),
            data: pointform_data.data
        };
        if (isdragged) {
            this.view.updatePointOption(pointform_data);
        } else {
            this.pointChanged(pointform_data);
        }

        this.onZPointChanged && this.onZPointChanged(this, data);
    },

    onMouseDown: function() {
        alert('mouse down');
    },

    onMouseUp: function(event, isdragged, data) {
        if (isdragged) {
            this.pointFormSubmit(data, isdragged);
        }
        this.view.setPointFormValues(data);
    },

    onMouseDrag: function() {
        alert('mouse drag');
    }

}
