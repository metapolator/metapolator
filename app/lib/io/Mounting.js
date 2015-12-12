define([
    'ufojs/errors'
  , 'ufojs/tools/io/_base'
  , 'obtain/obtain'
  , './helpers/Path'
  , 'EventEmitter'
], function(
    errors
  , Parent
  , obtain
  , Path
  , EventEmitter
) {
    "use strict";

    /*global process: true*/
    /*global setTimeout: true*/

    var IOEntryExistsError = errors.IOEntryExists
      , IONotDirError = errors.IONotDir
      , IONoEntryError = errors.IONoEntry
      , assert = errors.assert
      , Argument = obtain.Argument
      ;

    function Mounting(baseIo) {
        Parent.call(this);
        this._baseIo = baseIo;

        this._mounted = Object.create(null);
        // path length is number of segments/path parts not number of characters
        this._mountPointsByPathLength = Object.create(null);
        this._longestMountPoint = 0;
    }
    var _p = Mounting.prototype = Object.create(Parent.prototype);
    _p.constructor = Mounting;

    /**
     * One would think that mountPoint must exist in this._baseIo and
     * that it must be a directory. However, this creates big problems
     * in here. E.g. we can't prevent that the directory is removed by
     * using baseIo directly.
     * Thus, what we do is just to create a mapping and if there is
     * no path to the mapping, some things won't work out as expected.
     * However, readDir returns virtual directories for parts of mount
     * point paths and rmDir will raise IONotDirError when trying to delete
     * a mount point.
     * I'm guess there are lots of corner cases we still need to cover.
     */
    _p.mount = function (io, mountPoint, pathOffset) {
        var mountPointPath = Path.Factory(mountPoint)
          , pathOffsetPath
          , len
          , byPathLen
          ;
        if(mountPointPath.normalPath in this._mounted)
            throw new IOEntryExistsError('Mount Point "' + IOEntryExistsError + '" is already in use');

        pathOffsetPath = Path.Factory(pathOffset || '');
        this._mounted[mountPointPath.normalPath] = [io, pathOffsetPath.normalPath];
        len = mountPointPath.path.length;
        byPathLen = this._mountPointsByPathLength[len];
        if(!byPathLen) {
            this._mountPointsByPathLength[len] = byPathLen = Object.create([]);
            // A mountPoint can't be above root (see Path)
            // thus this is a collision free key
            Object.defineProperty(byPathLen, '../length', {
                value: 0
              , writable: true
            });
        }
        byPathLen['../length'] +=1;
        byPathLen[mountPointPath.normalPath] = true;
        if(len > this._longestMountPoint)
            this._longestMountPoint = len;
    };

    _p.isMountPoint = function(path) {
        var normal = (new Path(path)).normalPath;
        if(normal in this._mounted)
            return false;
    };

    _p.umount = function (mountPoint) {
        // If mountPoint does not exist, this does not change anything.
        var mountPointPath = Path.Factory(mountPoint)
          , len = mountPointPath.path.length
          , byPathLen = this._mountPointsByPathLength[len]
          ;
        delete this._mounted[mountPointPath.normalPath];
        if(!byPathLen)
            return;

        byPathLen['../length'] -=1;
        if(byPathLen['../length'] === 0) {
            delete this._mountPointsByPathLength[len];
            // we just deleted the last of the longest mount points
            if(this._longestMountPoint === len)
                // need to find the next longest mountpoint
                this._longestMountPoint = Math.max.apply(null,
                                Object.keys(this._mountPointsByPathLength)
                                      .map(Number)
                                      .filter(isFinite)
                );
        }
        else
            delete byPathLen[mountPointPath.normalPath];
    };

    /**
     * To get a path (for read, write whatever) we should
     * A) normalize the path.
     * B) traverse a list of mountpoints (shortest to longest in terms of
     *    directory segements) and pick the first matching one.
     * C) if there is a matching mountpoint, dispatch to the mouned io
     *    take offset + rest of original path and go.
     * D) if there is no matching mountpoint, dispatch to baseIo
     */
    _p._dispatchTarget = function (path) {
        // find a mountpoint:
        var requestPath = Path.Factory(path)
          , parts = requestPath.path
          , i, l, pathLen, sub = ''
          , byPathLen
          , dispatchPath = path
          , mountPoint
          ;

        //This  supports also a zero length mountpoint.
        i=-1;l=parts.length;pathLen= i+1;
        do {
            if(pathLen > this._longestMountPoint)
                // no need to look further
                break;
            // first iteration: zero length mountpoint check
            byPathLen = this._mountPointsByPathLength[pathLen];
            if(!byPathLen || (!(sub in byPathLen))) {
                // iterate
                i += 1;
                pathLen = i+1;
                sub = (i===0)
                    ? parts[i]
                    : [sub, parts[i]].join('/')
                    ;
                continue;
            }
            // got a match!
            mountPoint = this._mounted[sub];
            dispatchPath = [mountPoint[1]].concat(parts.slice(pathLen)).join('/');

            return [mountPoint[0], dispatchPath];
        } while(i<l);

        // it's not within a mountpoint, so it must be in this._baseIo
        // NOTE: we could add a baseIO offset here an create a second handy
        // use for this module.
        // That can be done with a zero length mountPoint as well though!
        return [this._baseIo, dispatchPath];
    };

    function _dispatch(async, dispatchTarget, funcName, args_) {
        var io = dispatchTarget[0]
          , path = dispatchTarget[1]
          , args = [async, path]
          ;
        Array.prototype.push.apply(args, args_);
        return io[funcName].apply(io, args);
    }

    function _getArgs(len /* l arguments */){
        var i, args =[];
        assert(len === arguments.length -1, 'Wrong amount of arguments. '
                    + 'Expected ' + len + ' but got ' + arguments.length);
        // i is 1 to exclude len itself
        // note that i = len is expected index
        for(i=1;i<=len;i++)
            args.push(arguments[i]);
        return args;
    }

    /**
     * This expects 'async' to be the first argument and  'path' to be the
     * second argument of `funcName`. This is ubiquitous in the io API.
     *
     * extraArgs_ is an array of argument names (strings) of anything that
     * is expected after 'path', may be empty.
     * If it is falsy, no arguments other than `async` and `path` will be
     * injected into the dispatched call.
     */
    function _obtainRequestFactory(funcName_, extraArgs_) {
        var funcName = new Argument(funcName_)
          , api = ['path']
          , extraArgs = !!extraArgs_
                    ? (extraArgs_ instanceof Array ? extraArgs_ : [extraArgs_])
                    : []
          , argsGetter
          ;
        argsGetter = [extraArgs.length];
        Array.prototype.push.apply(argsGetter, extraArgs);
        argsGetter.push(_getArgs);

        Array.prototype.push.apply(api, extraArgs);

        return obtain.factory(
            {
                dispatchTarget: ['path', _p._dispatchTarget]
              , dispatch: [false, 'dispatchTarget', funcName, 'args', _dispatch]
              , args: argsGetter
            }
          , {
                dispatch: [true,  'dispatchTarget', funcName, 'args', _dispatch]
            }
          , api
          , function(obtain){ return obtain('dispatch'); }
        );
    }

    (function(target, factory, apiDefinition){
        var k;
        for(k in apiDefinition)
            target[k] = factory.apply(null, apiDefinition[k]);
    })( _p, _obtainRequestFactory, {
        readFile: ['readFile', undefined]
      , writeFile: ['writeFile', ['data']]
      , appendFile: ['appendFile', ['data']]
      , unlink: ['unlink', undefined]
      , readBytes: ['readBytes', ['bytes']]
      , stat: ['stat', undefined]
      , pathExists: ['pathExists', undefined]
      , getMtime: ['getMtime', undefined]
      , _readDir: ['readDir', undefined]
      , mkDir: ['mkDir', undefined]
      , ensureDir: ['ensureDir', undefined]
      , _rmDir: ['rmDir', undefined]
    });

    // This also has to run when the original readir throws an
    // IONotDirError or IONoEntryError
    _p._augmentDirectoryListing = function(path, listing) {
        // If the path is an ancestor of one of the mount points
        // and the listing contains no hints of a physical mount point path
        // OR it contains contradicting information, like a file, where
        // a mount point implies a directory
        // Then we should add/override the missing information
        var requestPath = Path.Factory(path)
            // mount points that are 1 segment longer than requestPath are
            // possible direct children
          , pathLen = requestPath.path.length
          , searchToken = requestPath.normalPath + '/'
          , children = [], i, l
          , setOfNames = Object.create(null)
          , result
          , k
          ;
        // First we need all mount points that are subpaths of path or
        // contained in subpaths of path.
        function filterNonChildren (p){
            // must begin with requestPath.normalPath + '/' or it is not contained
            return p.indexOf(searchToken) === 0;
        }
        function getDirectChildName (p) {
            // + '/' => mark as a directory
            return p.split('/').slice(pathLen, pathLen+1) + '/';
        }

        for(k in this._mountPointsByPathLength) {
            // skip paths with less segements
            if(parseInt(k, 10) <= pathLen)
                continue;
            // add all direct child directories to the children array.
            Array.prototype.push.apply(children ,
                Object.keys(this._mountPointsByPathLength[k])
                    // remove everything that is not a sub directory path
                    .filter(filterNonChildren)
                    // get only the direct child directory name
                    .map(getDirectChildName)
            );
        }

        for(i=0,l=children.length;i<l;i++)
            setOfNames[children[i]] = true;

        for(i=0,l=listing.length;i<l;i++) {
            // add all items of listing except if they are files and
            // there is already a path of that name registered.
            if(listing[i] + '/' in setOfNames)
                // There is a directory of this name, that directory
                // is part of the path to a mount point.
                continue;
            setOfNames[listing[i]] = true;
        }
        // sort?
        return Object.keys(setOfNames);
    };

    _p.readDir = obtain.factory(
        {
            readDirResult: ['path', function(path) {
                var listing
                  , result = {
                        error: null
                      , data: null
                    }
                  ;
                try {
                    result.data = this._readDir(false, path);
                }
                catch(error) {
                    if( !(error instanceof IONoEntryError)
                                    && !(error instanceof IONotDirError))
                        throw error;
                    result.error = error;
                }
                return result;
            }]
          , listing: ['path', 'readDirResult', function(path, readDirResult) {
                var listing = this._augmentDirectoryListing(path, readDirResult.data || []);
                if(!listing.length && readDirResult.error)
                    throw readDirResult.error;
                return listing;
            }]
        }
      , {
            readDirResult: ['path', function(path) {
                var result = {
                    error: null
                  , data: null
                };
                function callback(data) {
                    result.data = data;
                    return result;
                }
                function errback(error) {
                    if(!(error instanceof IONoEntryError)
                                        && !(error instanceof IONotDirError))
                        throw error;
                    result.error = error;
                    return result;
                }
                return this._readDir(true, path).then(callback, errback);
            }]
        }
      , ['path']
      , function job(obtain) {
            return obtain('listing');
        }
    );

    _p.rmDir = obtain.factory(
        {
            isMountPoint: ['path', _p.isMountPoint]
          , rmDir: [false, 'path', _p._rmDir]
        }
      , {
            rmDir: [true, 'path', _p._rmDir]
        }
      , ['path']
      , function job(obtain, path) {
            if(obtain('isMountPoint'))
                throw new IONotDirError('You can\'t rmDir(path) "'+path+'", '
                            + ' it is a mount point. Use io.umount(path) instead.');
            return obtain('rmDir');
        }
    );

    return Mounting;
});
