"use strict";
define([
    'intern!object'
  , 'intern/chai!assert'
  , 'metapolator/Metapolator'
], function (registerSuite, assert, Metapolator) {
    registerSuite({
        name: 'Metapolator',
        Metapolator_Constructor: function() {
            var model = {}
              , angularApp = {
                    constants: []
                  , constant: function(name, value){
                       this.constants[name] = value;
                    }
                }
              , frontend = {}
              , metapolator = new Metapolator(model, angularApp)
              ;
            assert.strictEqual(metapolator.angularApp, angularApp,
                                       'AngularApp is expected as interface');
            
            
            assert.strictEqual(angularApp.constants.metapolatorModel, model,
                    'Metapolator should register model as a constant service.');
            
            assert.isTrue('registerFrontend' in angularApp.constants,
                    'Metapolator should register registerFrontend as '
                   + 'a constant service.');
            
            assert.isFunction(angularApp.constants.registerFrontend,
                    'The registerFrontend service must be a function');
            
            angularApp.constants.registerFrontend(frontend);
            assert.strictEqual(metapolator.frontend, frontend,
                    'After registering frontend shoukd be available.');
            
            assert.throws(angularApp.constants.registerFrontend.bind(null, frontend),
                    Error, undefined, 'registerFrontend can\'t be used twice');
            
            
        }
    });
});
