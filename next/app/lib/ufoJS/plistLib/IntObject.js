/**
 * Copyright (c) 2011, Lasse Fister lasse@graphicore.de, http://graphicore.de
 * 
 * You should have received a copy of the MIT License along with this program.
 * If not, see http://www.opensource.org/licenses/mit-license.php
 * 
 * This Object is to store the "integer" object of a plist file. Its needed
 * because the number object of javascript is always like a float.
 * 
 * note that doing things like
 * var i = IntObject(12);
 * i++;
 * makes it a number, no longer an IntObject
 */
define(function() {
    "use strict";
    
    function IntObject(val) {
        this.value = parseInt(val, 10);
    }
    
    IntObject.prototype = new Number();
    IntObject.prototype.valueOf = function(){ return parseInt(this.value, 10); };
    IntObject.prototype.toString = function(){ return this-0; };
    
    IntObject.constructor = IntObject;
    return IntObject;
});
