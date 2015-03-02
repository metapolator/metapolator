// REST interface to FS
// dirs end with a / files don't end with a /
define([
], function(
){
    "use strict";
    var express = require('express')
      , path = require.nodeRequire('path')
      , fs = require.nodeRequire('fs')
      ;

    var _ForbiddenError = function(msg){
        this.name = 'NotFound';
        this.message = msg;
        Error.call(this, msg);
        Error.captureStackTrace(this, _ForbiddenError);
    };

    // Sanitize a file path, ensuring it doesn't go above /
    var _cleanPath = function(s) {
        /*jshint newcap:false*/
        s = path.normalize(s);
        // If the path goes above root, return 500
        if (s.split('/')[0] === '..')
            throw new _ForbiddenError('path "' + s + '" is above root');
        return s;
    };

    // callback for fs.readdir
    // attaches a slash to every directory name
    var _getDirectoryListingHandler = function(dirName, res, next, err, files) {
        var i
          , failed = false
          , resolved = 0
          , callback = function(files, i, err, stat) {
                resolved++;
                if(failed) return; // failed already
                if(err) {
                    failed = true;
                    next(err);
                    return;
                }
                if(stat.isDirectory())
                    files[i] += '/';
                if(resolved === files.length)
                    res.send(files.join('\n'));
            }
         ;
        if(err)
            next(err);
        else
            for(i=0;i<files.length;i++)
                fs.stat(dirName+'/'+files[i], callback.bind(null, files, i));
    };

    // serve usable status codes for the directory PUT
    var _mkDirHandler = function(res, next, err) {
        if(err)
            if(err.code === 'EEXIST')
                // I allow the trial to create an existing
                // dir, response is 204 in that case
                res.send(204);// No content returned
        else
            res.send(400, 'Can\'t create dir: ' + err); // Bad Request
        else
            res.send(201);// Created
    };

    // serve usable status codes for the directory DELETE
    var _rmDirHandler = function(res, next, err) {
        if(err && err.code !== 'ENOENT')
            res.send(400, 'Can\'t delete dir: ' + err); // Bad Request
        else
            res.send(204);// No content returned
    };

    // file PUT and POST
    var _writeFileHandler = function(res, next, err) {
        if(err)
            next(err);
        else
            res.send(204);
    };

    var _unlinkFileHandler = function(res, next, err) {
        if(err && err.code !== 'ENOENT')
            next(err);
        else
            res.send(204);
    };

    var restfs = function(rootDir) {
        if(rootDir.slice(-1) === '/')
            rootDir = rootDir.slice(0, -1);
        return express()
        .use(function(req, res, next) {
            var name = _cleanPath(req.path)
              , method = req.method
              , fullPath = [rootDir, name].join('/')
              ;
            if(name.slice(-1) === '/') {
                // directory
                switch(method) {
                    case 'GET':
                    case 'HEAD':
                    // return a directory listing
                    fs.readdir(fullPath
                            , _getDirectoryListingHandler.bind(null, fullPath, res, next));
                    break;
                    case 'PUT':
                    // try to create the directory
                    fs.mkdir(fullPath, _mkDirHandler.bind(null, res, next));
                    break;
                    case 'DELETE':
                    fs.rmdir(fullPath, _rmDirHandler.bind(null, res, next));
                    break;
                    default:
                    res.send(405);// 405 Method Not Allowed
                }
            }
            else {
                // file
                switch(method) {
                    case 'GET':
                    case 'HEAD':
                    // return the file content
                    res.sendfile(fullPath);
                    break;
                    case 'PUT':
                    case 'POST':
                    // write the file
                    // get the data
                    req.rawData = '';
                    // FIXME: for real server usage we should at least
                    // control the length of the data, also, content
                    // validation should happen. For that we must have
                    // an idea of the file type that is sent ...
                    // However, this code is intended to run locally
                    // not on the internet.
                    // also, it would be interesting to see if binary
                    // data survives this ...
                    req.on('data', function(chunk) {
                        req.rawData += chunk;
                    });
                    req.on('end', function(method) {
                        // assert method === PUT || method === POST
                        // use appendFile for POST
                        fs[method === 'PUT' ? 'writeFile': 'appendFile'](
                            fullPath, req.rawData,
                                _writeFileHandler.bind(null, res, next));
                    }.bind(null, method));
                    break;
                    case 'DELETE':
                    fs.unlink(fullPath, _unlinkFileHandler.bind(null, res, next));
                    break;
                    default:
                    res.send(405);// 405 Method Not Allowed
                }
            }
        })
        .use(function errorHandler(err, req, res, next) {
            if(err instanceof _ForbiddenError)
                res.send(403, 'Forbidden: ' + err.message);
            else
                // default error handler of express
                next();
        });
    };

    return restfs;
});
