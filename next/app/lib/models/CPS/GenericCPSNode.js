define([
    './_Node'
  , 'gonzales/gonzales'
], function(
    Parent
  , gonzales
) {
    "use strict";
    /**
     * We keep the CPS declarations that we don't understand as Generic
     * CPS object around. These objects can be turned into a CPS string
     * that equals their source from a semantic point of view. The
     * GenericCPSNode makes it possible to be non-destructive and forgiving
     * with CPS originating from other applications etc.
     */
    function GenericCPSNode(ast, source, lineNo) {
        Parent.call(this, source, lineNo);
        this._ast = ast;
    }
    var _p = GenericCPSNode.prototype = Object.create(Parent.prototype)
    _p.constructor = GenericCPSNode;
    
    // should this return a deep copy to protect its data??
    // since we are not about changing a GenericCPSNode at all,
    // it shouldn't be possible to change the _ast data!
    // Object.defineProperty(_p, 'ast', {
    //     get: function(){ return this._ast.slice(); }
    // })
    
    _p.toString = function() {
        return gonzales.csspToSrc(this._ast)
    }
    
    Object.defineProperty(_p, 'type', {
        get: function(){ return this._ast[0]; }
    })
    
    return GenericCPSNode;
})
