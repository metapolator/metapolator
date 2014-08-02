define([
   './_BaseModel'
 , './ContainerModel'
], function(
    _BaseModel
  , ContainerModel
){
    "use strict";
    //this is a stub to wire things up.


    /**
     * This is intended to become the become the single root Model
     * of Metapolator. All other models will live in here
     */
    function AppModel() {
        // only needed if _BaseModel does something with the model
        // _BaseModel.call(this)
        this.generic = new ContainerModel('My first widget container')
    }
    // class like inheritance pattern:
    var _p = AppModel.prototype = Object.create(_BaseModel.prototype);

    return AppModel;
})
