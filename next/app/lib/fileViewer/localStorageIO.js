/**
 * This I/O module is for unit testing of I/O dependent modules.
 * It is intentionally very primitive at the beginning, parts may be missing.
 */
define([
    'ufojs/errors'
  , 'ufojs/tools/io/_base'
  , '../obtainJS/lib/obtain'
], function(
    errors
  , _base
  , obtain
) {
    "use strict";
    
    function TestingIO() {
        this.files = {};
    }
    
    // inherit from the base module, so we raise NotImplemented errors
    // when something is missing.
    var _p = TestingIO.prototype = Object.create(_base);
    
    /**
     * raises IONoEntry when path is not found.
     */
    _p.readFile = obtain.factory(
        {
            readFile:['path', function(path) {
                return localStorage.getItem(path);
            }]
        }
      , {/* no need for async here */}
      , ['path']
      , function(obtain){ return obtain('readFile'); }
    );
    
    
    /**
     * TODO: raises IONoEntry when path is in an non-existant directory
     */
    _p.writeFile = obtain.factory(
        {
            writeFile:['path', 'data', function(path, data) {
                this.files[path] = [data, new Date()]
            }]
        }
      , {/* no need for async here */}
      , ['path', 'data']
      , function(obtain){ return obtain('writeFile'); }
    );
    
    /**
     * raises IONoEntry when path is not found.
     */
    _p.unlink = obtain.factory(
        {
            unlink:['filename', function(filename) {
               if(!this.pathExists(false, filename))
                    throw new errors.IONoEntry('Filename not found: '+ filename);
                delete this.files[filename]
            }]
        }
      , {/* no need for async here */}
      , ['filename']
      , function(obtain){ return obtain('unlink'); }
    );
    
    _p.pathExists = obtain.factory(
        {
            pathExists:['path', function(path) {
                return (localStorage.getItem(path)?true:false);
            }]
        }
      , {/* no need for async here */}
      , ['path']
      , function(obtain){ return obtain('pathExists'); }
    );
    
    
    
    _p.getMtime = obtain.factory(
        {
            getMtime:['path', function(path) {
                if(!this.pathExists(false, path))
                    throw new errors.IONoEntry('Path not found: '+ path);
                return 'application/json';
            }]
        }
      , {/* no need for async here */}
      , ['path']
      , function(obtain){ return obtain('getMtime'); }
    );
    
    
    return TestingIO;
});