/**
 * Copyright (c) 2011, Lasse Fister lasse@graphicore.de, http://graphicore.de
 * 
 * You should have received a copy of the MIT License along with this program.
 * If not, see http://www.opensource.org/licenses/mit-license.php
 * 
 * This Object is to store the "data" object of a plist file.
 * 
 * Since there is currently no case where I need the decoding/encoding
 * feature and since the window.btoa/atob are not available everywhere
 * this object is nothing more than a marker that the data came-from/should-end-in
 * a "data" Object of a plist file. Handling of decoding encoding is delayed.
 * See the commented out code if is helpful for the task.
 */
define(function() {
    "use strict";
    function DataObject(data) {
        this._data = data;
    }
    DataObject.prototype.valueOf = DataObject.prototype.toString = function(){return this._data;};
    return DataObject;
   /**
    * Do we need base64 encode/decode here?
    * 
    * This uses window.btoa and window.atob which are not available everywhere
    * so a common interface to this tasks would be nice.
    * from: https://developer.mozilla.org/en/DOM/window.btoa#Unicode_Strings
    *    "Unicode Strings:
    *     In most browsers, calling window.btoa on a Unicode string will
    *     cause a Character Out Of Range exception."
    * anyways, there is a workaround in the same article encoding strings to
    * utf-8
    
    function DataObject(base64Encoded){
        this.data = window.atob(base64Encoded);
    }
    
    enhance(DataObject, {
        toString: function(){
            return window.btoa(this.data)
        }
    });
    */
});
