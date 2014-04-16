define([
    'require/domReady'
  , 'ng/main'
], function(
    domReady
  , angularMain
){
    function Metapolator() {
        console.log('init Metapolator')
        domReady(this._domReadyHandler.bind(this))
    }
    var _p = Metapolator.prototype;

    _p._domReadyHandler = function() {
        angularMain.bootstrap(document)
    }

   return Metapolator;
})
