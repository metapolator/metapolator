define([
    './_Node'
  , './Master'
], function(
    Parent
  , Master
) {
    "use strict";
    /**
     * This is the root element of a MOM Tree.
     * 
     * This Element is the container of all masters of a metapolator superfamily.
     * It only contains children of type MOM Master
     */
    function Univers() {
        Parent.call(this);
    }
    var _p = Univers.prototype = Object.create(Parent.prototype);
    _p.constructor = Univers;
    
    Object.defineProperty(_p, 'type', {
        get: function(){return 'MOM Univers';}
    })
    
    _p._acceptedChildren = [Master];
    
    return Univers;
})
