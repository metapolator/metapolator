define([
    'metapolator/errors'
  , './_Collection'
  , './AtRuleName'
], function(
    errors
  , Parent
  , AtRuleName
) {
    "use strict";
    var CPSError = errors.CPS;
    /**
     * A Collection of Rules and Comments
     */
    function AtRuleCollection(name, items, source, lineNo) {
        Parent.call(this, items, source, lineNo);
        if(name)
            this._name = name;
    }
    var _p = AtRuleCollection.prototype = Object.create(Parent.prototype)
    _p.constructor = AtRuleCollection;

    _p.toString = function() {
        return ['@', this._name ? this.name : 'name_not_set',
                ' {\n', this._items.join('\n\n'),'\n}'].join('')
    }

    /**
     * Due to the way the parsing is done, name can be set after
     * initialisation but only once.
     *
     * If name is not set, trying to read the name raises an CPSError
     */
    Object.defineProperty(_p, 'name', {
        set: function(name) {
            if(this._name)
                throw new CPSError('Name is already set');
            if(!name instanceof AtRuleName)
                throw new CPSError('Name has the wrong type, expected '
                    + 'AtRuleName but got: ' + name.constructor.name
                        ? name.constructor.name
                        : name.constructor);
            this._name = name;
        }
      , get: function(){
            if(!this._name)
                throw new CPSError('Name not set yet.');
            return this._name.name;
        }
    })

    return AtRuleCollection;
})
