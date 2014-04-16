define([
    'require/domReady'
  , 'ng/app'
], function(
    domReady
  , angularApp
){
    function Metapolator() {
        console.log('init Metapolator')
        domReady(this._domReadyHandler.bind(this))
    }
    var _p = Metapolator.prototype;

    _p._domReadyHandler = function() {
        angularApp.bootstrap(document)
    }

   return Metapolator;
})
