define([
    'metapolator/errors'
  , '../_BaseModel'
  , 'metapolator/models/CPS/selectorEngine'
], function(
    errors
  , Parent
  , selectorEngine
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
            throw new MOMError('MOM _Node must not be instanciated directly');
        
        Object.defineProperty(this, 'nodeID', {value: getUniqueID()});
        
        this._children = [];
        this._parent = null;
        this._id = null;
        this._classes = {};
        
        
        // We need a place to store the instanciated values of the CPS
        // this should be in the _Node where the values belong to.
        // However, I need some exploration time to come up with a lean
        // way to connect this stuff.
        
        // the instances of the parameters of this node itself
        // these can be referred to in @scope
        // we have to build these at some point in time!
        // given that they are always valid, as long as the CPS doesn't
        // change, a good idea is to build these parameters lazy.
        // because we wan't to load the cps AFTER the MOM (or?)
        this._parameterInstances = {}
        
        // the names that can be used from the CPS
        // these will be defineable via @scope
        // I'm not shure if it is wise to keep these references here around
        // another option would be to query them when needed to build a
        // _parameterInstance. That way we wouldn't have to invalidate this
        // cache
        this._parameterScope = {}
        
    }
    var _p = _Node.prototype = Object.create(Parent.prototype);
    _p.constructor = _Node;
    
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
    
    
    /**
     * Needed for development, I don't know if this will persist
     */
    Object.defineProperty(_p, 'particulars', {
        get: function() {
            return [this.type,
                  , (this.id ? '#' + this.id : '')
                  , (this.parent
                        ? ':i(' + this.parent.find(this) + ') of ' + this.parent.particulars
                        : '(no parent)')
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
     * childrens, I wonder if we need to come up with some tricky shortcut
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
        }
      , get: function(){ return this._parent; }
    })
    
    _p.remove = function(item) {
        var i = this.find(item);
        if(i === false)
            throw new MOMError([this, 'can\'t remove', item ,'because',
                                'it is not a child.'].join(' '));
        this._children.splice(i, 1);
        item.parent = null;
        return true;
    }
    
    _p.add = function(item) {
        if(!this.qualifiesAsChild(item))
            throw new MOMError([this, 'doesn\'t accept', item
                                        , 'as a child object.'].join(' '));
        if(item.parent !== null)
            item.parent.remove(item);
        this._children.push(item);
        item.parent = this;
    }
    
    _p.query = function(selector) {
        return selectorEngine.query(this, selector);
    }
    
    return _Node;
})
