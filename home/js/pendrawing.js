var showBezierHandles = false;

// Color me sensible.
var colors = {
    guideColor: rgba(0, 80, 255, 90),
    angleColor: rgba(65, 100, 197, 140),
    positionColor: rgba(240, 50, 50, 140),
    widthColor: rgba(100, 200, 173, 140),
    tensionColor: rgba(255, 180, 20, 140),
    glyphColor: new Color(0),
    transparentColor: rgba(0, 0, 0, 0)
}

// Convert 0-255 RGBA to 0-1 RGBA.
function rgba(r, g, b, a) {
    var color = new Color(r / 255.0, g / 255.0, b / 255.0, a / 255.0);
    return color
}

function distanceBetween(p0, p1) {
    p0 = p0.position;
    p1 = p1.position;
    distance = Math.sqrt(Math.pow((p1.x - p0.x), 2)
        + Math.pow((p1.y - p0.y), 2));
    return distance
}

function angleBetween(p0, p1) {
    p0 = p0.position;
    p1 = p1.position;
    angle = Math.atan2((p1.y - p0.y), (p1.x - p0.x)) * 180 / Math.PI;
    return angle
}

function pointOnCircle(point, angle, distance) {
    x = point.position.x + (distance * Math.sin(angle * Math.PI / 180));
    y = point.position.y + (distance * Math.cos(angle * Math.PI / 180));
    return {'x': x, 'y': y}
}

function hobby2Bezier(p0, p1, theta0, theta1, tension) {
    var x0 = p0.position.x;
    var y0 = p0.position.y;
    var x3 = p1.position.x;
    var y3 = p1.position.y;
    var theta0 = theta0 * (Math.PI / 180);
    var theta1 = theta1 * (Math.PI / 180);
    // From http://levien.com/phd/two_frame.pdf
    var a = Math.sqrt(2);
    var b = 1 / 16.0;
    var c = (3 - Math.sqrt(5)) / 2;
    var alpha = a *
        (Math.sin(theta0) - b * Math.sin(theta1)) *
        (Math.sin(theta1) - b * Math.sin(theta0)) *
        (Math.cos(theta0) - Math.cos(theta1));
    var rho = (2 + alpha) /
        (1 + (1 - c) * Math.cos(theta0) + c * Math.cos(theta1));
    var sigma = (2 - alpha) /
        (1 + (1 - c) * Math.cos(theta1) + c * Math.cos(theta0));
    var x1 = (rho / 3 * tension) * Math.cos(theta0);
    var y1 = (rho / 3 * tension) * Math.sin(theta0);
    var x2 = 1 - (sigma / 3 * tension) * Math.cos(theta1);
    var y2 = sigma / 3 * tension * Math.sin(theta1);

    return {
        'handleOut': [x1, y1],
        'handleIn': [x2, y2]
    }
}

var activeHandle = null;
function onMouseUp(event) {
    if (activeHandle) {
        activeHandle.fillColor = colors.transparentColor;
        activeHandle = null;
    }
}

// handle is a colored dot that the user can click and drag.
function handle(x, y, size, color) {
    this.handle = new Path.Circle(new Point(x, y), size);
    this.handle.strokeWidth = 2;
    this.handle.strokeColor = color;
    this.handle.fillColor = colors.transparentColor;
    this.handle.onMouseDown = function(event) {
        this.fillColor = this.strokeColor;
        activeHandle = this;
    }
    this.handle.onMouseDrag = function(event) {
        this.position += event.delta;
    }
}

function penWidget(x, y, theta) {
    this.p = new handle(x, y, 12, colors.positionColor);
    this.angle = 120;
    this.width = 32;
    this.theta = theta;
    this.angleHandle = new handle(x, y, 9, colors.angleColor);
    this.widthHandle = new handle(x, y, 9, colors.widthColor);
    this.thetaHandle = new handle(x, y, 9, colors.angleColor);

    var that = this;

    this.update = function() {
        that.widthHandle.handle.position =
            pointOnCircle(that.p.handle, that.angle - 180, that.width);
        that.angleHandle.handle.position =
            pointOnCircle(that.p.handle, that.angle, that.width);
        that.thetaHandle.handle.position =
            pointOnCircle(that.p.handle, that.theta, 72);
    }
    this.update();

    this.p.handle.onMouseDrag = function(event) {
        this.position += event.delta;
        that.update();
    }
    this.angleHandle.handle.onMouseDrag = function(event) {
        this.position += event.delta;
        that.angle = 270 - angleBetween(this, that.p.handle);
        that.update();
    }
    this.widthHandle.handle.onMouseDrag = function(event) {
        this.position += event.delta;
        that.width = distanceBetween(this, that.p.handle);
        that.update();
    }
    this.thetaHandle.handle.onMouseDrag = function(event) {
        this.position += event.delta;
        that.theta = 270 - angleBetween(this, that.p.handle);
        that.update();
    }
}

function strokeWidget(x) {
    // Glyph shape
    this.path = new Path();
    this.path.fillColor = colors.glyphColor;
    this.path.moveTo(10, 20);
    this.path.cubicCurveTo([30,40], [50,60], [70,80]);
    this.path.lineTo(90,100)
    this.path.cubicCurveTo([110,120], [130,140], [150,160])
    this.path.closePath();
    this.path.fullySelected = showBezierHandles;
    this.path.sendToBack();

    this.pw0 = new penWidget(x, 50, 0);
    this.pw1 = new penWidget(x, 350, 180);

    this.tension = 0;
    this.tensionHandle = new handle(x, y, 9, colors.tensionColor);

    var that = this;

    this.path.onMouseDrag = function(event) {
        that.pw0.p.handle.position += event.delta;
        that.pw1.p.handle.position += event.delta;
        that.pw0.update();
        that.pw1.update();
        that.update();
    }

    this.tensionHandle.handle.onMouseDrag = function(event) {
        this.position += event.delta;
        // Calculate the tension value.
        var angle = angleBetween(that.pw1.p.handle, that.pw0.p.handle);
        var distance = distanceBetween(that.pw0.p.handle,
                that.pw1.p.handle) * 0.5;
        var poc = pointOnCircle(that.pw0.p.handle, 360 - angle - 90, distance);
        that.tension = distanceBetween(this, {'position': poc});
        that.update();
    }

    this.update = function() {
        // Calculate tensionHandle position
        var angle = angleBetween(that.pw1.p.handle, that.pw0.p.handle);
        var distance = distanceBetween(that.pw0.p.handle,
                that.pw1.p.handle) * 0.5;
        var poc = pointOnCircle(that.pw0.p.handle, 360 - angle - 90, distance);
        var pos = pointOnCircle({'position': poc}, 360 - angle, that.tension);
        that.tensionHandle.handle.position = pos;

        handles = hobby2Bezier(
            that.pw0.angleHandle.handle, that.pw1.angleHandle.handle,
            360 - that.pw0.theta + 90,
            that.pw1.theta + 90,
            that.tension
        );
        that.path.segments[0].point = that.pw0.angleHandle.handle.position;
        that.path.segments[0].handleOut = handles.handleOut;
        that.path.segments[1].point = that.pw1.angleHandle.handle.position;
        that.path.segments[1].handleIn = handles.handleIn;
        handles = hobby2Bezier(
            that.pw0.widthHandle.handle, that.pw1.widthHandle.handle,
            360 - that.pw0.theta + 90,
            that.pw1.theta + 90,
            that.tension
        );
        that.path.segments[2].point = that.pw1.widthHandle.handle.position;
        that.path.segments[2].handleOut = handles.handleIn;
        that.path.segments[3].point = that.pw0.widthHandle.handle.position;
        that.path.segments[3].handleIn = handles.handleOut;
    }
    this.update();
}

var sw0 = new strokeWidget(100);
var sw1 = new strokeWidget(200);
var sw2 = new strokeWidget(300);

function onMouseDrag(event) {
    sw0.update();
    sw1.update();
    sw2.update();
}