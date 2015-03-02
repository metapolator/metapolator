define([
    'ufojs/errors'
  , 'obtain/obtain'
], function(
    ufoErrors
  , obtain
) {
    "use strict";

    /**
     * when name ends with a slash it is a directory name
     */
    function _isDirName(name) {
        return name.slice(-1) === '/';
    }

    /**
     * Read an entire directory tree into a flat list of filenames.
     *
     * use this with caution:
     * It may run long and need a lot of memory for large/deep directories.
     * Also, the result may not be correct anymore when it's done.
     * This is why we don't use it as a standard io function.
     * A better approach for large trees may be an iterator based
     * implementation.
     */
    var readDirRecursive = obtain.factory(
        {
            names: ['io', 'path', function(io, path) {
                return io.readDir(false, path);
            }]
          , readDir: ['io', 'names', 'path',
            function(io, names, path) {
                var i
                  , name
                  , fullPath
                  , children
                  , result = []
                  ;
                for(i=0;i<names.length;i++) {
                    name = names[i];
                    fullPath = [path, name].join(path.slice(-1) === '/' ? '' : '/');
                    if(_isDirName(name)) {
                        children = readDirRecursive(false, io, fullPath);
                        Array.prototype.push.apply(result, children);
                    }
                    else
                        result.push(fullPath);
                }
                return result;
            }]
        }
      , {
            names: ['io', 'path', function(io, path) {
                return io.readDir(true, path);
            }]
          , readDir: ['io', 'names', 'path', '_callback',
            function(io, names, path , callback) {
                var i
                  , name
                  , loaded = 0
                  , loading
                  , fullPath
                  , failed = false
                  , promise
                  , result = []
                  ;
                function finalize(children) {
                    if(failed) return;
                    Array.prototype.push.apply(result, children);
                    loaded++;
                    if(loaded === loading)
                        callback(null, result);
                }
                function fail(error) {
                    failed = true;
                    callback(error, null);
                }
                for(i=0;i<names.length;i++) {
                    name = names[i];
                    fullPath = [path, name].join(path.slice(-1) === '/' ? '' : '/');
                    if(_isDirName(name)) {
                        loading++;
                        promise = readDirRecursive(true, io, fullPath)
                        .then(finalize, fail);
                    }
                    else
                        result.push(fullPath);
                }
                if(!loading)
                    callback(null, result);
            }]
        }
      , ['io', 'path']
      , function(obtain){ return obtain('readDir'); }
    );
    return readDirRecursive;
});
