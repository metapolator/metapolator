define([
    'ufojs/tools/pens/AbstractPointPen'
 ], function(
    Parent
) {
    "use strict";

    function RecordingPointPen() {
        Parent.call(this);
        this._commands = [];
    }
    var _p = RecordingPointPen.prototype = Object.create(Parent.prototype);

    _p._addCommand = function (name, args) {
        this._commands.push([name, args]);
    };

    _p.drawPoints = function(pen) {
        var i,l, command,commands = this._commands;
        for(i=0,l=commands.length;i<l;i++) {
            command = commands[i];
            pen[command[0]].apply(pen, command[1]);
        }
    };

    /**
     * Start a new sub path.
     */
    _p.beginPath = function(kwargs/*optional, dict*/) {
        this._addCommand('beginPath', [kwargs || {}]);
    };

    /**
     * End the current sub path.
     */
    _p.endPath = function() {
        this._addCommand('endPath', []);
    };

    /**
     * Add a point to the current sub path.
     */
    _p.addPoint = function(
        pt,
        segmentType /* default null */,
        smooth /* default false */,
        name /* default null */,
        kwargs /* default an object, javascript has no **kwargs syntax */
    ) {
        segmentType = (segmentType === undefined) ? null : segmentType;
        smooth = (smooth || false);
        name = (name === undefined) ? null : name;
        kwargs = (kwargs || {});//an "options" object
        this._addCommand('addPoint', [pt, segmentType, smooth, name, kwargs]);
    };

    /**
     * Add a sub glyph.
     */
    _p.addComponent = function(baseGlyphName, transformation) {
        this._addCommand('addComponent', [baseGlyphName, transformation]);
    };

    return RecordingPointPen;
});
