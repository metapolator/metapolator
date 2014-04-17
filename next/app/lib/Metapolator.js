"use strict";
define([
    'require/domReady'
  , 'DOM/document'
  , 'angular'
  , 'ng/app'
], function(
    domReady
  , document
  , angular
  , angularApp
){
    function Metapolator() {
        this.frontend = undefined;
        angularApp.constant('registerFrontend', this._registerFrontend.bind(this))
        
        // this should be the last thing here, because domReady will execute
        // immediately if dom is already ready.
        domReady(this._domReadyHandler.bind(this))
    }
    var _p = Metapolator.prototype;

    _p._domReadyHandler = function() {
        angular.bootstrap(document, [angularApp.name]);
        
        setTimeout(this._requestInterfaces.bind(this), 500)
    }
    _p._registerFrontend = function(appController) {
        if(this.frontend !== undefined)
            throw new Error('Registering more than one AppController is not allowed.'
                           +' Don\'t use <metapolator> more than once in a template!')
        this.frontend = appController;
    }
    
    _p._requestInterfaces = function () {
        // so, this should be a very abstract way to say angular, that we
        // need interfaces for something …
        // something might be a model, that is, the data representation of something
        // we would expect two different things from an interface:
        //    being a view: that changes it's display when the model changes
        //    beeing a control: that reports changes to the model
        //    an interface can be view, control or both. Usually a control
        //    is in some way or the other always a view, too, however, a
        //    very simple control might not need to react to changes of the
        //    value.
        //
        // the control flow is as follows:
        // control->changes model (user interaction)->
        // model->reports change to view/control
        // view/control->displays value
        
        // initiation is done as follows:
        // an interface can't exist without model, so:
        // var model = new Model()
        // var interface = new Interface(Model)
        // we create the model here an then request an interface for it.
        // The angular app will have to decide how to display model …
        
        // the api between angular and this will change a lot at the beginning :-)
        
        // this.frontend.display()
        
        var stub = function(){console.log(this.name, 'was stubbed.')}
          , model1 = {name: 'test-model 1', value: 23, stub:stub}
          , model2 = {name: 'test-model 2', value: 42, stub:stub}
          ;
        this.frontend.provideInterface(model1)
        this.frontend.provideInterface(model2)
    }
    
    return Metapolator;
})
