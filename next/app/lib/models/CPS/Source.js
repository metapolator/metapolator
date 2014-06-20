define([

], function(

) {
    "use strict";
    /**
     * The source of a all _Nodes in one PropertyCollection.
     * Currently only the name. To trace later where a value
     * comes from.
     */
    function Source(name) {
        this._name = name;
    }
    
    var _p = Source.prototype;
    
    _p.toString = function() {
        return ['<Source:', this._name, '>'].join(' ');
    }
    
    Object.defineProperty(_p, 'name', {
        get: function(){ return this._name; }
    });
    
    return Source;
})
