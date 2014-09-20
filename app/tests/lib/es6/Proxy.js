 define([
    'intern!object'
  , 'intern/chai!assert'
  , 'es6/Proxy'
], function (
    registerSuite
  , assert
  , Proxy
) {
    "use strict";
        registerSuite({
        name: 'EcmaScript 6 direct proxies',
        Proxy_as_a_whitelist: function() {
            // implement a whitelist and a getter like we use it for
            // cps whitelists, because Proxy is bleeding edge ES6 and
            // we patched it with harmony-reflect to an uptodate api
            // so it's important to see it working!
            function Err(){ this.name = 'TEST PROXY ERROR'; }
            var handler = {
                    _whitelist: {a: 'b', b: 'c'}
                  , get: function(target, name, receiver) {
                       if(!(name in this._whitelist))
                            //not accessible
                            throw new Err();
                        return target[this._whitelist[name]];
                    }
                  , has: function(target, name, receiver){
                        return name in this._whitelist;
                    }
                  , set: function(target, name) {
                        // don't allow setting things
                        throw new Err();
                    }
                }
              , obj = {a: 'AA', b: 'BB', c: {}}
              , proxy = new Proxy(obj, handler)
              ;
            assert.equal(proxy.a, obj.b);
            assert.strictEqual(proxy.b, obj.c);
            assert.throws(function(){ proxy.c; }, Err);
            assert.throws(function(){ proxy.c = 1; }, Err);
            assert.throws(function(){ proxy.x = 1; }, Err);
        }
    });
});
