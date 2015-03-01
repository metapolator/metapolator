define([
    'metapolator/errors'
  , '../../_BaseModel'
], function(
    errors
  , Parent
) {
    "use strict";

    var AbstractInterfaceError = errors.AbstractInterface;

    /**
     * All Elements in a ParametersCollection have this base type OR
     * should at least expose the same Interface (ducktyping).
     */
    function _Node(source, lineNo) {
        Parent.call(this)
        this._source = source;
        this._lineNo = lineNo;
    }
    var _p = _Node.prototype = Object.create(Parent.prototype)
    _p.constructor = _Node;
    
    _p.toString = function() {
        throw new AbstractInterfaceError('This interface is abstract and'
            + 'needs an implementation (parameters/_Node.toString)');
    }
    
    function _getterCreator(item) {
        var external = item[0]
          , internal = item[1]
          ;
        Object.defineProperty(this, external, {
            get: function(){ return this[internal]; }
        })
    };
    ([
        ['source', '_source']
      , ['lineNo', '_lineNo']
    ].forEach(_getterCreator, _p));
    
    return _Node;
})
