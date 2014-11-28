define([
    'ufojs/errors'
  , 'ufojs/tools/io/_base'
  , 'obtain/obtain'
  , 'path'
  , 'EventEmitter'
], function(
    errors
  , Parent
  , obtain
  , path
  , EventEmitter
) {
    "use strict";

    /*global process: true*/
    /*global setTimeout: true*/

    var NotImplementedError = errors.NotImplemented
      , IOError = errors.IO
      , IONotDirError = errors.IONotDir // node error: ENOTDIR
      , IOIsDirError = errors.IOIsDir // node error: EISDIR
      , IONoEntryError = errors.IONoEntry // node error: ENOENT
      , IOEntryExistsError = errors.IOEntryExists // node error: EEXIST
      , IONotEmptyError = errors.IONotEmpty // ENOTEMPTY
      , assert = errors.assert
      , Argument = obtain.Argument
      ;
    /*** lower level ***/

    var next = (typeof process !== 'undefined' && typeof process.nextTick === 'function')
            ?   process.nextTick.bind(process)
            :   function(cb){ setTimeout(cb, 0); }
            ;

    function Path(pathStr) {
        var _path;
        this.normalPath = path.normalize(pathStr);
        this.rawPath = pathStr;
        if(this.normalPath[0] === '/')
            this.normalPath = this.normalPath.slice(1);

        if(this.normalPath.slice(-1) === '/')
            this.normalPath = this.normalPath.slice(0,-1);

        this.basename = path.basename(this.normalPath);

        // if(this.basename = '' && this.normalPath '')
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
        if(_path.length === 1 && _path[0] === 1)
            _path = [];
        Object.defineProperty(this, 'path'
                        , {get: Array.prototype.slice.bind(_path)});
        Object.defineProperty(this, 'directory'
                        , {get: Array.prototype.slice.bind(_path, 0, -1)});
        Object.seal(this);
    }
    Path.factory = function(pathString){ return new Path(pathString); };

    function Node (mtime) {
        this.modified(undefined, mtime);
    }
    Node.prototype = Object.create(null);

    Node.prototype.modified = function(event, mtime) {
        this.mtime = mtime || new Date();
        this._parent = undefined;
    };
    Node.prototype.setParent = function(parent) {
        assert(!this._parent, 'Node has a parent.');
        assert(parent instanceof Directory, '"parent" must be a Directory');
        assert(parent.isChild(this), 'This is not child of "parent".');
        this._parent = parent;
    };
    Node.prototype.unsetParent = function() {
        if(!this._parent) return;
        assert(!this._parent.isChild(this), 'This is still a child of "parent".');
        this._parent = undefined;
    };
    Node.prototype.hasParent = function() {
        return !!this._parent;
    };

    function File(content, mtime) {
        Node.call(this, mtime);
        this._content = content || "";
    }
    File.prototype = Object.create(Node.prototype);

    Object.defineProperty(File.prototype, 'content', {
        set: function(content) {
            this._content = content;
            this.modified();
        }
      , get: function() {
            return this._content;
        }
    });

    function Directory(mtime) {
        Node.call(this, mtime);
        this._content = Object.create(null);
        this._index = new Map();
    }
    Directory.prototype = Object.create(Node.prototype);

    Directory.prototype.lookup = function (/* names */) {
        var names = Array.prototype.slice.call(arguments, 1)
          , name = arguments[0]
          , item
          , relatives = {'.': this, '..': this._parent}
          ;
        if(arguments.length === 0)
            return this;

        if(typeof name !== 'string' || name === '')
            throw new TypeError('A name must be a none empty string, '
                                                +'but it is: "'+name+'"');

        if(relatives.hasOwnProperty(name))
            item = relatives[name];
        else if(name in this._content)
            item = this._content[name];
        // If relatives this._parent is not set, item is also undefined.
        // Thus, this MUST NOT be an `else` clause.
        if(!item)
            throw new IONoEntryError(name);

        if(item instanceof Directory)
            return item.lookup.apply(item, names);

        if (names.length)
            throw new IONotDirError(name);

        return item;
    };

    Directory.prototype.getItem = function(type, names) {
        var item = this.lookup.apply(this, names);
        if(type === Directory && !(item instanceof Directory))
            throw new IONotDirError('"' +names.join('/') + '" is not a directory');
        else if(type === File && (item instanceof Directory))
            throw new IOIsDirError('"' +names.join('/') + '" is not a file');
        else if(type && !(item instanceof type))
            throw new IOError('"' +names.join('/') + '" is not a type of: ' + type);
        return item;
    };

    Directory.prototype.isChild = function(item) {
        return this._index.has(item);
    };

    Directory.prototype.setItem = function(name, item) {
        var target;
        if(!(item instanceof Node))
            throw new TypeError('"item" must be an Node');

        target = this._content[name];
        if(target instanceof Directory){
            if(item instanceof File)
                throw new IOIsDirError('"'+name+'" is a directory');
            throw new IOEntryExistsError('directory "'+name+'" exists');
        }
        else if (target instanceof File && item instanceof Directory)
            throw new IOEntryExistsError('file "'+name+'" exists');
        else if(item.hasParent())
            throw new IOError('item "'+name+'" has a parent already');
        else if(item === this)
            throw new IOError('item is this directory');

        this._content[name] = item;
        this._index.set(item, name);
        item.setParent(this);
        this.modified();
    };

    Directory.prototype.isEmpty = function() {
        // this._index.size is not yet supported in in Node v0.10.25 with --harmony
        for(var k in this._content) return false;
        return true;
    };

    Directory.prototype.removeItem = function(type, name) {
        var item = this.getItem(type, [name]);
        if(item instanceof Directory && !item.isEmpty())
            throw new IONotEmptyError(' "'+ name +'" directory is not empty');

        if(!this.isChild(item))
            throw new IOError(' "'+ name +'" is not a child.');
        delete this._content[name];
        this._index['delete'](item);
        item.unsetParent(this);
        this.modified();
    };

    Object.defineProperty(Directory.prototype, 'entries', {
        get: function() {
            var k, results = [];
             for(k in this._content)
                 results.push(this._content[k] instanceof Directory ? k+'/' : k);
            return results;
        }
    });

    /*** higher level ***/
    function InMemory() {
        Parent.call(this);
        this._root = new Directory();
        this._events = new EventEmitter();
    }

    var _p = InMemory.prototype = Object.create(Parent.prototype);

    _p.on = function() {
        this._events.on.apply(this._events, arguments);
    };
    _p.off = function() {
        this._events.off.apply(this._events, arguments);
    };

    _p._emit = function(name, data /* , more, data, ... */) {
        // don't do this synchronously. So anyone can finish their current business
        var args = [this._events], func;
        Array.prototype.push.apply(args, arguments);
        func = Function.prototype.bind.apply(this._events.trigger, args);
        next(func);
    };

    _p._trigger = function(name, path) {
        this._emit(name, path);
        this._emit('all', Object.freeze({event: name, path: path}));
    };

    _p._getItem = function(path, type, property) {
        var item = this._root.getItem(type || Node, path.path);
        return (property === undefined ? item : item[property]);
    };

    _p._writeFile = function(path, content, append) {
        var dir = this._root.getItem(Directory, path.directory)
          , file;
        try {
            file = dir.getItem(File, [path.basename]);
            if(append)
                file.content += content;
            else
                file.content = content;
            this._trigger('change', path.normalPath);
        }
        catch(error) {
            if(!(error instanceof IONoEntryError))
                throw error;
            file = new File(content);
            dir.setItem(path.basename, new File(content));
            this._trigger('add', path.normalPath);
        }
    };

    _p._delete = function(path, type) {
        var dir = this._root.getItem(Directory, path.directory);
        dir.removeItem(type, path.basename);
        this._trigger('unlink' + (type === Directory ? 'Dir' : ''), path.normalPath);
    };

    _p._pathExists = function(path) {
        try {
            return !!this._getItem(path);
        }
        catch(error) {
            if(!(error instanceof IONoEntryError))
                throw error;
        }
        return false;
    };
    _p._mkDir = function(path) {
        var dir = this._root.getItem(Directory, path.directory);
        dir.setItem(path.basename, new Directory());
        this._trigger('addDir', path.normalPath);
    };

    function _obtainRequestFactory(extraAPI, request) {
        var api = ['pathString'];
        if(extraAPI)
            Array.prototype.push.apply(api,
                        extraAPI instanceof Array ? extraAPI : [extraAPI]);
        return obtain.factory(
            {
                path: ['pathString', Path.factory]
              , request: request
            }
          , {}
          , api
          , function(obtain){ return obtain('request'); }
        );
    }

    _p.readFile = _obtainRequestFactory(undefined, ['path', File, new Argument('content'), _p._getItem]);
    _p.getMtime = _obtainRequestFactory(undefined, ['path', undefined, new Argument('mtime'), _p._getItem]);
    _p.readDir = _obtainRequestFactory(undefined, ['path', Directory, new Argument('entries'), _p._getItem]);
    _p.pathExists = _obtainRequestFactory(undefined, ['path', _p._pathExists]);

    _p.writeFile = _obtainRequestFactory('data', ['path', 'data', false, _p._writeFile]);
    _p.appendFile = _obtainRequestFactory('data', ['path', 'data', true, _p._writeFile]);
    _p.unlink = _obtainRequestFactory(undefined, ['path', File, _p._delete]);
    _p.rmDir = _obtainRequestFactory(undefined, ['path', Directory, _p._delete]);
    // `readBytes` is not implemented
    _p.mkDir = _obtainRequestFactory(undefined, ['path', _p._mkDir]);
    _p.ensureDir = _obtainRequestFactory(undefined, ['path', function(path) {
        try {
            return this._mkDir(path);
        }
        catch(error) {
            if(!(error instanceof IOEntryExistsError))
                throw error;
            return 0;
        }
    }]);

    return InMemory;
});
