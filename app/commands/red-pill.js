define([
    'metapolator/errors'
  , 'metapolator/cli/ArgumentParser'
  , 'ufojs/tools/io/staticNodeJS'
  , 'metapolator/project/MetapolatorProject'
  , 'fs'
  ], function (
    errors
  , ArgumentParser
  , io
  , MetapolatorProject
  , fs
) {
    "use strict";
    var CommandLineError = errors.CommandLine
      , argumentParser = new ArgumentParser('red-pill')
      , module
      ;
    
    function main(commandName, argv) {
            // arguments are mandatory and at the end of the argv array
            // readArguments MUST run before readOptions
        var args = argumentParser.readArguments(argv)
            // options are after the command name and berfore the arguments
            // readOptions MUST run after readArguments
          , options = argumentParser.readOptions(argv)
          ;
        
        
        console.log(['This is your last chance.'
          , 'After this, there is no turning back. You take the blue '
          , 'pill—the story ends, you wake up in your bed and believe '
          , 'whatever you want to believe. You take the red pill—you '
          , 'stay in Wonderland, and I show you how deep the rabbit hole '
          , 'goes. Remember, all I\'m offering is the truth—nothing more.'
          , '\n\n'
          , 'Metapolator: Serving the red pill ... '
          ].join('')
        );
        
        var express = require('express')
          , app = express()
            // expect process.mainModul to be path/to/metapolator-code/metapolator 
            // thus path/to/metapolator-code is the root directory
          , rootDir = process.mainModule.filename
                    .slice(0, process.mainModule.filename.lastIndexOf('/'))
          , libDir = rootDir + '/app/lib'
          , index = rootDir + '/app/red-pill.html'
            // the process must be started inside of the current dir. so
            // we expect.
            // TODO: check if projectDir is indeed a metapolator project
          , projectDir = process.cwd() + '/'
          ;
        
        
        // red-pill.html as index
        // all contents of /lib are served for get at /lib
        // the current working directory
        // if it is a metapolator project
        // served as a full featured REST service at /project
        // dirs end with a / files don't end with a /
        // we resolve all ./ and ../ if we have a 'buffer underrun' because
        // ../ removes more dirs than there are in path, we return a 500
        
        
        // serve index at '' (index)
        // serve hello world at project/{...}
        
        function ForbiddenError(msg){
            this.name = 'NotFound';
            this.message = msg;
            Error.call(this, msg);
            Error.captureStackTrace(this, ForbiddenError);
        };
        
        /**
         * express seems to sanitize req.path for us. so this method may
         * be superflous. Beeing very paranoid, I keep it however
         */
        function _clearPath(path) {
            var isDir = path.slice(-1) === '/'
              , parts = path.split('/')
              , result = []
              , i = 0
              ;
            for(;i<parts.length;i++) {
                if(parts[i] in {'': null, '.':null})
                    continue;
                else if (parts[i] === '..')
                    if(result.lenght === 0)
                        // use a forbidden error
                        throw new ForbiddenError('path "' + path + '" is below root');
                    else
                        result.pop();
                else
                    result.push(parts[i]);
            }
            return result.join('/') + (isDir ? '/' : '');
        }
        
        // callback for fs.readdir
        function _getDirectoryListingHandler(res, next, err, files) {
            if(err)
                next(err);
            else
                res.send(files.join('\n'));
        }
        
        // serve usable status codes for the directory PUT
        function _mkDirHandler(res, next, err) {
            if(err)
                if(err.code === 'EEXIST')
                    // I allow the trial to create an existing
                    // dir, response is 204 in that case
                    res.send(204);// No content returned
                else
                    res.send(400, 'Can\'t create dir: ' + err); // Bad Request
            else
                res.send(201);// Created
        }
        // serve usable status codes for the directory DELETE
        function _rmDirHandler (res, next, err) {
            if(err && err.code !== 'ENOENT')
                res.send(400, 'Can\'t delete dir: ' + err); // Bad Request
            else
                res.send(204);// No content returned
        }
        
        // file PUT
        function _writeFileHandler(res, next, err) {
            if(err)
                next(err);
            else
                res.send(204);
        }
        
        function _unlinkFileHandler(res, next, err) {
            if(err && err.code !== 'ENOENT')
                console.log(err), next(err);
            else
                res.send(204);
        }
        
        // simple logger
        app.use(function(req, res, next) {
            console.log('logger ! %s %s', req.method, req.url);
            next();
        });
        
        app.use('', function(req, res, next) {
            if(req.path === '/')
                res.sendfile(index);
            else
                next();
        });
        
        // serve the contents of rootDir + "app/lib" at lib
        app.use('/lib', express.static(libDir));
        
        // project is a RESTful directory
        app.use('/project', function(req, res, next) {
            var path = _clearPath(req.path)
              , method = req.method
              , data
              ;
            console.log('method', req.method, path.slice(-1) === '/', path);
            if(path.slice(-1) === '/') {
            // directory
                switch(method) {
                    case 'GET':
                    case 'HEAD':
                        // return a directory listing
                        fs.readdir([projectDir, path].join('/')
                                   , _getDirectoryListingHandler
                                                .bind(null, res, next));
                        break;
                    case 'PUT':
                        // try to create the directory
                        fs.mkdir(path, _mkDirHandler.bind(null, res, next))
                        break;
                    case 'DELETE':
                        fs.rmdir(path, _rmDirHandler.bind(null, res, next))
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
                        res.sendfile([projectDir, path].join('/'));
                        break;
                    case 'PUT':
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
                        req.on('end', function() {
                            fs.writeFile(path, req.rawData,
                                _writeFileHandler.bind(null, res, next))
                        });
                        break;
                    case 'DELETE':
                        fs.unlink(path, _unlinkFileHandler.bind(null, res, next));
                        break;
                    default:
                        res.send(405);// 405 Method Not Allowed
                }
            }
        });
        
        app.use(function errorHandler(err, req, res, next) {
            if(err instanceof ForbiddenError)
                res.send(403, 'Forbidden: ' + err.message);
            else
                // default error handler of express
                next();
        });
        app.listen(3000);
        
    }
    
    module = {main: main};
    Object.defineProperty(module, 'help', {
        get: argumentParser.toString.bind(argumentParser)
    });
    return module;
})
