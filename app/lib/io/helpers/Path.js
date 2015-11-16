define([
    'ufojs/errors'
  , 'path'
], function(
    errors
  , path
) {
    "use strict";

    /*global process: true*/
    /*global setTimeout: true*/

    var assert = errors.assert
      ;

    function Path(pathStr_) {
        var _path, pathStr = pathStr_ || '';
        this.normalPath = path.normalize(pathStr);
        this.rawPath = pathStr;
        if(this.normalPath[0] === '/')
            this.normalPath = this.normalPath.slice(1);

        if(this.normalPath.slice(-1) === '/')
            this.normalPath = this.normalPath.slice(0,-1);

        this.basename = path.basename(this.normalPath);

        _path = (this.normalPath !== "")
                    ? path.dirname(this.normalPath).split('/')
                    : []
                    ;
        if(this.basename !== '')
            _path.push(this.basename);

        if(_path[0] === '.')
            _path.shift();
        if(_path[0] === '..')
            throw new TypeError('Path "' + this.normalPath +'" is above root.');

        Object.defineProperty(this, 'path'
                        , {get: Array.prototype.slice.bind(_path)});
        Object.defineProperty(this, 'directory'
                        , {get: Array.prototype.slice.bind(_path, 0, -1)});
        Object.seal(this);
    }
    Path.Factory = function(pathString){ return new Path(pathString); };

    return Path;
});
