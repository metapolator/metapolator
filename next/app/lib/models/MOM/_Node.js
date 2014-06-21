define([
    'metapolator/errors'
  , '../_BaseModel'
], function(
    errors
  , Parent
) {
    "use strict";
    
    var MOMError = errors.MOM;
    
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
        
        this._children = [];
        this._parent = null;
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
    
    // start selector engine
    
    /**
     * takes one simpleSelector
     */
    _p._simpleSelectorMatches(simpleSelector) {
        if(!(simpleSelector instanceof SimpleSelector))
        // this error will be used to mark the  compound selector 
        // or selector list as invalid. 
            throw new errors.MOMSelector('simpleSelector is not of type '
                                         + 'SimpleSelector');
        throw new errors.NotImplemented('Implement _simpleSelectorMatches');
    }
    
    /**
     * A simple selector is either a type selector, universal selector,
     * class selector, ID selector, or pseudo-class. 
     * 
     * This method returns true if all of its arguments are simple selectors
     * and match this node. If one argument is no simple selector
     * this method raises an errors.MOMSelector Error.
     */
    _p.simpleSelectorMatches = function(/* list of simple selectors */) {
        var selectors = Array.prototype.slice.call(arguments)
          , i = 0;
        for(;i<selectors.length;i++)
            if(!this._simpleSelectorMatches(selectors[i]))
                return false;
        return true;
    }
    
    /**
     * A compound selector is a chain (list) of simple selectors that
     * are not separated by a combinator.
     * 
     * It always begins with a type selector or a (possibly implied)
     * universal selector. No other type selector or universal
     * selector is allowed in the sequence.
     * 
     * If one item of the  simple selectors list is no simple selector
     * this method raises an errors.MOMSelector Error.
     */
    _p.compoundSelectorMatches = function(simpleSelectors) {
        return this.simpleSelectorMatches.apply(this, simpleSelectors);
    }
    
    
    return _Node;
})
