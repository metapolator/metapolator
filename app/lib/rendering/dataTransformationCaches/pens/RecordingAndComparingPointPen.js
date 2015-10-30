define([
    './RecordingPointPen'
], function(
    Parent
) {
    "use strict";

    function RecordingAndComparingPointPen(compareCommands) {
        Parent.call(this);
        this._compareCommands = compareCommands || [];
        this._commands = [];
        this.changed = false;
    }

    var _p = RecordingAndComparingPointPen.prototype = Object.create(Parent.prototype);

    _p.getCommands = function() {
        return this._commands;
    };

    _p._hasChanged = function(command) {
        var other = this._compareCommands[this._commands.length]
          , data, otherData
          ;
        if(!other)
            return true;
        if(command[0] !== other[0])
            return true;
        // this is not going to happen, because RecordingPointPen
        // normalizes this
        // if(command[1].length !== other[1].length) return true;
        data = command[1];
        otherData = other[1];
        switch(command[0]){
            //case ('beginPath') :
                // I don't compare kwargs here yet. a probably easy
                // to do thing would be to compare JSON.stringfy here.
                // my focus is however to detect outline changes, not
                // identifier or name changes etc.
                // skips data[0] === kwargs
            //case ('endPath') :
                // nothing to compare
            //    break;
            case ('addComponent'):
                if(data[0] !== otherData[0])
                    return true;
                if(Array.prototype.join(data[1],',') !== Array.prototype.join(otherData[1],','))
                    return true;
                break;
            case ('addPoint'):
                if(Array.prototype.join.call(data[0],',') !== Array.prototype.join.call(otherData[0],','))
                    return true;
                if(data[1] !== otherData[1])
                    return true;
                if(data[2] !== otherData[2])
                    return true;
                // skips data[3] === name and data[4] === kwargs
        }
        return false;
    };

    _p._addCommand = function(name, args) {
        var command = [name, args];
        // once changed we don't compare any further!
        if(!this.changed)
            this.changed = this._hasChanged(command);
        this._commands.push(command);
    };
    return RecordingAndComparingPointPen;
});
