define([
], function(){
    "use strict";

    function FS(name) {
        this.name = name;
        this.length = 0;
    }

    var _p = FS.prototype = Object.create(Storage.prototype);


    _p.setObject = function(key, value) {
        console.log(_p);
        this.setItem(key, JSON.stringify(value)).bind(this);
    }

    _p.getObject = function(key) {
        var value = this.prototype.getItem(key);
        return value && JSON.parse(value);
    }

    _p.getKeys = function() {
        var keys;
        for (var i = 0; this.length - 1; i++) {
            keys.push(this.key[i]);
        }
        return keys;
    }
    
    return FS;
})
