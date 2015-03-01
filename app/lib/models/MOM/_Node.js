define([
    'metapolator/errors'
  , '../_BaseModel'
  , 'metapolator/models/CPS/whitelistProxies'
], function(
    errors
  , Parent
  , whitelistProxies
) {
    "use strict";

    var MOMError = errors.MOM;

    var _id_counter = 0;
    function getUniqueID() {
        return _id_counter++;
    }

    /**
     * The MOM is the structure against which we can run the selector queries
     * of CPS. We must be able to answer the the question "is this element
     * selected by that selector" for each item of the MOM.
     *
     * All Elements of the Metpolator Object Model MOM inherit from _Node.
     * This means, that a test like `item instanceof _Node` must return true.
     */
    function _Node() {
        Parent.call(this);
        if(this.constructor.prototype === _p)
            throw new MOMError('MOM _Node must not be instantiated directly');
        Object.defineProperty(this, 'nodeID', {value: getUniqueID()});

        this._children = [];
        this._parent = null;
        this._index = null;
        this._id = null;
        this._classes = {};
        this.cps_proxy = whitelistProxies.generic(this, this._cps_whitelist);
    }
    var _p = _Node.prototype = Object.create(Parent.prototype);
    _p.constructor = _Node;

    _p._cps_whitelist = {
        parent: 'parent'
      , children: 'children'
      , master: 'master'
      , univers: 'univers'
      , multivers: 'multivers'
      , index: 'index'
      , type: 'type'
    };

    _p.clone = function() {
        var clone = new this.constructor(), i,l;
        this._cloneProperties(clone);
        for(i=0,l=this._children.length;i<l;i++)
            clone.add(this._children[i].clone());
        return clone;
    };

    _p._cloneProperties = function(clone) {
        if(this._id)
            clone.id = this._id;
        for(var k in this._classes)
            clone.setClass(k);
    }

    Object.defineProperty(_p, 'MOMType', {
        get: function(){return 'MOM '+ this.constructor.name ;}
    })

    /**
     * Implement a getter for CPS Type in children of _Node, we need it
     * for the cps selector engine.
     *
     * cpsType should be a simple string, minuses are are ok, don't do
     * anything fancy. Don't use already taken names.
     */
    Object.defineProperty(_p, 'type', {
        get: function() {
            // this should be implemented by items inheriting from _Node
            throw errors.NotImplemented('Implement CPS-Type name!');
        }
    })

    Object.defineProperty(_p, 'children', {
        /**
         * returns a copy of this._children so we can't mess around
         * with the list of children via public interfaces.
         */
        get: function(){ return this._children.slice(); }
    })

    Object.defineProperty(_p, 'id', {
        /**
         * The Mechanism how id's are verified etc. need to be defined,
         * probably on a per MOM-Element base. And probably always the
         * parent is responsible for id checking and setting. At the
         * moment, I need id's to write the selector engine, and for that,
         * I don't need propper checked IDs
         */
        set: function(id){ this._id = id; }
      , get: function(){ return this._id; }
    })

    /***
     * get the univers element of this node.
     *
     * a univers element itself has no univers!
     */
    Object.defineProperty(_p, 'univers', {
        get: function() {
            if(!this._parent)
                return null;
            if(this._parent.MOMType === 'MOM Univers')
                return this._parent;
            return this._parent.univers;
        }
    })

    /***
     * get the multivers element of this node.
     *
     * a multivers element itself has no multivers!
     */
    Object.defineProperty(_p, 'multivers', {
        get: function() {
            if(!this._parent)
                return null;
            if(this._parent.MOMType === 'MOM Multivers')
                return this._parent;
            return this._parent.multivers;
        }
    })

    /***
     * get the master element of this node or null if this node has no master
     *
     * neither multivers nor univers have a master
     */
    Object.defineProperty(_p, 'master', {
        get: function() {
            if(!this._parent)
                return null;
            if(this._parent.MOMType === 'MOM Master')
                return this._parent;
            return this._parent.master;
        }
    })

    Object.defineProperty(_p, 'glyph', {
        get: function() {
            return this._parent && this._parent.glyph;
        }
    })

    /**
     * returns a selector for this element, currently it is used for
     * display puposes, so the additionial information "(no parent) "
     * is prepended if the item has no parent
     */
    Object.defineProperty(_p, 'particulars', {
        get: function() {
            return [
                    this._parent ? this._parent.particulars : '(no parent)'
                  , ' '
                  , this.type,
                  , (this.id ? '#' + this.id : '')
                  , (this._parent
                        ? ':i(' + this._parent.find(this) + ')'
                        : '')
                ].join('');
        }
    })

    _p.setClass = function(name) {
        this._classes[name] = null;
    }

    _p.removeClass = function(name) {
        delete this._classes[name];
    }

    _p.hasClass = function(name) {
        return name in this._classes;
    }

    _p.toString = function() { return ['<', this.MOMType, '>'].join('') };

    _p.isMOMNode = function(item) {
        return item instanceof _Node;
    }

    /**
     *  enhance this list with accepted children Constructors
     */
    _p._acceptedChildren = [];


    _p.qualifiesAsChild = function(item) {
        var i=0;
        if(!this.isMOMNode(item) || item === this)
            return false;

        for(;i<this._acceptedChildren.length; i++)
            if(item instanceof this._acceptedChildren[i])
                return true;
        return false;
    }

    /**
     * Note: this is currently running very often when adding or deleting
     * children, I wonder if we need to come up with some tricky shortcut
     * to make the search faster.
     * On thing I already made is searching from back to front, because
     * a child node will call parent.find(this) exactly after beeing
     * added to the parent, to verify that it is indeed entitled to change
     * it's parent property. In that case searching from back to front is
     * the faster path.
     *
     */
    _p.find = function(item) {
        var i=this._children.length-1;
        for(;i>=0; i--)
            if(item === this._children[i])
                return i;
        return false;
    }

    Object.defineProperty(_p, 'index', {
        get: function(){ return this._index;}
    });

    Object.defineProperty(_p, 'parent', {
        /**
         * Use parent for reading only.
         *
         * Setting the parent property performs some checks if the new
         * property is indeed valid. The Parent is authoritative in this
         * case.
         *
         * In short: We made it hard to set the parent property because
         * we want you to use the 'add' method of the parent.
         */
        set: function(parent) {
            if(parent === null) {
                if(this._parent === null)
                    // already done
                    return;
                if(this._parent.find(this) !== false)
                    throw new MOMError('Can\'t unset the parent property '
                        +'when the parent still has this Node as a child');
                this._parent = null;
                this._index = null;
                return;
            }
            else if(this._parent !== null)
                throw new MOMError([this, 'is still a child of a', this._parent
                  , 'you can\'t set a new parent Node. Use "newParent.add(child)"'
                  , 'to move the child to another parent'].join(' '));
            else if (!this.isMOMNode(parent))
                throw new MOMError('The parent property must be a MOM Node, '
                    +'but it is: "' + parent + '" typeof: ' + typeof parent);
            else if(parent.find(this) === false)
                throw new MOMError('A MOM Node must already be a child '
                    + 'of its parent when trying to set its parent property. '
                    + 'Use "parent.add(child)" instead.');
            this._parent = parent;
            this._index = this._parent.find(this);
        }
      , get: function(){ return this._parent; }
    })

    _p.remove = function(item) {
        if(Object.isFrozen(this._children))
            throw new MOMError('Removing children is not allowed in this element.');
        var i = this.find(item);
        if(i === false)
            throw new MOMError([this, 'can\'t remove', item ,'because',
                                'it is not a child.'].join(' '));
        this._children.splice(i, 1);
        item.parent = null;
        return true;
    }

    _p.add = function(item) {
        if(Object.isFrozen(this._children))
            throw new MOMError('Adding children is not allowed in this element.');
        if(!this.qualifiesAsChild(item))
            throw new MOMError([this, 'doesn\'t accept', item
                                        , 'as a child object.'].join(' '));
        if(item.parent !== null)
            item.parent.remove(item);
        this._children.push(item);
        item.parent = this;
    }

    _p.query = function(selector) {
        return this.multivers.query(selector, this);
    }

    _p.queryAll = function(selector) {
        return this.multivers.queryAll(selector, this);
    }

    _p.getComputedStyle = function() {
        return this.multivers.getComputedStyleFor(this);
    }

    return _Node;
})
