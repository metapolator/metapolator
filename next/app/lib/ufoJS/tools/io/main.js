/**
 * This is a simple wrapper for asychronous I/O (just I actually) for
 * nodejs or the browser.
 * 
 * Its a stub to create the minimal needed filesystem functionality.
 * This might see heavy changes in the future
 */
define(['ufojs/errors'], function(errors) {
    "use strict";
    
    var IOError = errors.IO
      , IONoEntry = errors.IONoEntry
      ;
    
    /**
     * readfile:
     * both implementations assume a callback with the arguments (error, data)
     * when error is not 'null' or 'undefined' there was an error
     * The from parameter is not changed at all
     */
    if (typeof process !== 'undefined') {
        // this is node js
        var fs = require.nodeRequire('fs')
          ,  _0666 = parseInt('0666', 8)
          ;
        
        var _callbackAdapterFactory = function(callback) {
            return function(error, result) {
                if(error && error.code === 'ENOENT')
                    error = new IONoEntry(error.message, error.stack);
                callback(error, result);
            }
        }
        
        var readFile = function (from, callback) {
            callback = _callbackAdapterFactory(callback)
            fs.readFile(from, 'utf-8', callback);
        }
        
        var readFileSync = function(from) {
            try {
                return fs.readFileSync(from, 'utf-8');
            }
            catch(error) {
                if(error.code === 'ENOENT')
                    throw new IONoEntry(error.message, error.stack);
                throw error;
            }
        };
        
        var writeFile = function(filename, data, callback) {
            callback = _callbackAdapterFactory(callback)
            // checking this because the 3rd parameter of fs.writeFile
            // can be an option object too and we don't want to allow
            // this kind of hack, yet.
            if(typeof callback !== 'function')
                throw new IOError('"callback" must be a function but it is '
                    + typeof callback)
            fs.writeFile(filename, data, callback)
        }
        
        var writeFileSync = function(filename, data) {
            try {
                return fs.writeFileSync(filename, data);
            }
            catch(error) {
                if(error.code === 'ENOENT')
                    throw new IONoEntry(error.message, error.stack);
                throw error;
            }
            
        }
        
        var unlink = function(filename, callback) {
            callback = _callbackAdapterFactory(callback);
            fs.unlink(filename, callback);
        }
        
        var unlinkSync = function(filename) {
            try {
                return fs.unlinkSync(filename);
            }
            catch(error) {
                if(error.code === 'ENOENT')
                    throw new IONoEntry(error.message, error.stack);
                throw error;
            }
        }
        
        var readBytes= function(path, bytes, callback) {
            callback = _callbackAdapterFactory(callback)
            
            var onFile = function(err, fd) {
                if(err) {
                    callback(err);
                    return;
                }
                var buffer = new Buffer(bytes);
                fs.read(fd, buffer, 0, bytes, 0, onRead);
            },
            onRead = function(err, bytesRead, buffer) {
                if(err) {
                    callback(err);
                    return;
                }
                callback(undefined, buffer.toString('binary', 0, bytes));
            }
            fs.open(path, 'r', _0666, onFile);
        }
        
        var readBytesSync = function(path, bytes) {
            var file
             , buffer = new Buffer(bytes)
             , read
             ;
            
            try {
                file = fs.openSync(path, 'r');
            }
            catch(error) {
                if(error.code === 'ENOENT')
                    throw new IONoEntry(error.message, error.stack);
                throw error;
            }
            
            fs.readSync(file, buffer, 0, bytes, 0);
            fs.closeSync(file);
            return buffer.toString('binary', 0, bytes);
        }
        
        var pathExists = function(p, callback) {
            return fs.exists(p, callback);
        }
        var pathExistsSync = function(p) {
            return fs.existsSync(p);
        }
        var getMtime = function(path, callback) {
            callback = _callbackAdapterFactory(callback);
            function distillMtimeCallback(error, statObject) {
                var mtime = statObject
                                ? statusObjext.mtime
                                : statusObjext;
                callback(error, mtime)
            }
            fs.stat(path, distillMtimeCallback);
        };
        var getMtimeSync = function(path) {
            try {
                return fs.statSync(path).mtime;
            }
            catch(error) {
                if(error.code === 'ENOENT')
                    throw new IONoEntry(error.message, error.stack);
                throw error;
            }
        };
        
    } else {
        
        var _errorFromRequest = function(request) {
            var message = ['Status', request.status, request.statusText].join(' ')
            if(request.status === 404)
                return new IONoEntry(message);
            //just don't use this if request.status == 200 or so is no error
            return new IOError(message);
        }
        
        // assume this is in the browser
        var readFile = function(from, callback) {
            var request = new XMLHttpRequest()
              , result
              , error
              ;
            request.open('GET', from, true);
            
            request.onreadystatechange = function (aEvt) {
                if (request.readyState != 4 /*DONE*/)
                    return;
                
                if (request.status !== 200)
                    error = _errorFromRequest(request);
                else
                    result = request.responseText
                callback(error, result)
            }
            request.send(null);
        };
        
        var readFileSync = function(from) {
            var request = new XMLHttpRequest();
            request.open('GET', from, false);
            request.send(null);
            
            if(request.status !== 200)
                throw _errorFromRequest(request);
            
            return request.responseText;
        };
        
        var writeFile = function(filename, data, callback) {
            var request = new XMLHttpRequest()
              , result
              , error
              ;
            request.open('PUT', filename, true);
            request.onreadystatechange = function (aEvt) {
                if (request.readyState != 4 /*DONE*/)
                    return;
                
                if (request.status !== 200 || request.status !== 204
                            || request.status !== 202)
                    error = _errorFromRequest(request);
                callback(error, result);
            }
            request.send(data);
            
        }
        
        var writeFileSync = function(filename, data) {
            var request = new XMLHttpRequest();
            request.open('PUT', filename, false);
            request.send(data);
            if (request.status !== 200 || request.status !== 202
                    || request.status !== 204)
                throw _errorFromRequest(request);
            return;
        }
        
        var unlink = function(filename) {
            var request = new XMLHttpRequest()
              , result
              , error
              ;
            request.open('DELETE', filename, true);
            request.onreadystatechange = function (aEvt) {
                if (request.readyState != 4 /*DONE*/)
                    return;
                if (request.status !== 200 || request.status !== 202
                        || request.status !== 204)
                    error = _errorFromRequest(request);
                callback(error, result);
            }
            request.send(data);
        }
        
        var unlinkSync = function(filename) {
            var request = new XMLHttpRequest();
            request.open('DELETE', filename, false);
            request.send(data);
            if (request.status !== 200 || request.status !== 202
                    || request.status !== 204)
                throw _errorFromRequest(request);
            return;
        }
        
        var readBytes= function(path, bytes, callback) {
            var request = new XMLHttpRequest()
              , result
              , error
              ;
            request.open('GET', path, true);
            request.responseType = 'arraybuffer';
            request.onreadystatechange = function (aEvt) {
                if (request.readyState != 4 /*DONE*/)
                    return;
                
                if (request.status !== 200)
                    error = _errorFromRequest(request);
                else {
                    var  newChunk =  new Uint8Array(request.response, 0, bytes);
                    result = String.fromCharCode.apply(null, newChunk)
                }
                callback(error, result);
            }
            request.send(null);
        }
        
        var readBytesSync = function(path, bytes) {
            var request = new XMLHttpRequest();
            request.open('GET', path, false);
            // so there is no conversion by the browser
            request.overrideMimeType('text\/plain; charset=x-user-defined');
            request.send(null);
            
            if(request.status !== 200)
                throw _errorFromRequest(request);
            
            var chunk = request.response.slice(0, bytes),
                newChunk = new Uint8Array(bytes);
            // throw away high-order bytes (F7)
            for(var i=0; i<chunk.length; i++)
                newChunk[i] = chunk.charCodeAt(i);
            return String.fromCharCode.apply(null, newChunk);
        }
        
        var pathExists = function(p, callback) {
            var request = new XMLHttpRequest();
            request.open('HEAD', p, true);
            request.onreadystatechange = function (aEvt) {
                if (request.readyState != 4) return;
                callback(request.status === 200);
            }
            request.send(null);
        }
        var pathExistsSync = function(p) {
            var request = new XMLHttpRequest();
            request.open('HEAD', p, false);
            request.send(null);
            return request.status === 200;
        }
        var getMtime = function(path, callback){
            var request = new XMLHttpRequest()
              , result
              , error
              ;
            request.open('HEAD', path, true);
            request.onreadystatechange = function (aEvt) {
                if (request.readyState != 4  /*DONE*/)
                    return;
                
                if (request.status !== 200)
                    error = _errorFromRequest(request);
                else
                    result = new Date(request.getResponseHeader('Last-Modified'));
                callback(error, result);
            }
            request.send(null);
        };
        var getMtimeSync = function(path){
            var request = new XMLHttpRequest();
            request.open('HEAD', path, false);
            request.send(null);
            if(request.status !== 200)
                throw _errorFromRequest(request);
            return new Date(request.getResponseHeader('Last-Modified'));
        };
    }
    
    return {
        readFile: readFile,
        readFileSync: readFileSync,
        readBytes: readBytes,
        readBytesSync: readBytesSync,
        pathExists: pathExists,
        pathExistsSync: pathExistsSync,
        getMtime: getMtime,
        getMtimeSync: getMtimeSync
    };
});
