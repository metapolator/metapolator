## Classical Inheritance

This is the definitve guide how class like structures should be written
in Metapolator. A lot of people don't learn to do this in JavaScript. I even heard that 
here is no such thing like inheritance at all in Javascript.

I embed the examples into AMD/RequireJS modules, because this is how we
will encounter classes in Metapolator.

This guide is by no means complete! I know that these examples don't show
everything. I will extend this occasionally So please, if you have
questions or find flaws contact me.

```js
// file Foo.js
"use strict";
define([], function() {
    /**
     * This is the Constructor
     * usage: var foo = new Foo(12)
     */
    function Foo(value) {
        // underscore is our convention to mark a not public interface
        this._value = value
        
        // **NEVER** define methods in here when you wan't to inherit
        // from them. use the prototpe!
    }
    
    // we make a shortcut for prototype, because it's going to be
    // used a lot.
    var _p = Foo.prototype;
    
    // define constants, methods etc:
    _p._KIND = 'fooish Foo'
    
    /**
     * usage: foo.echo()
     * > This fooish Foo has a value of 15
     */
    _p.echo = functions() {
        console.log('This',this._KIND,'has a value of', this._value)
    }
    
    // export the 'class' as the module
    return Foo;
})

```
Let's do inheritance:

```js
// file Bar.js
"use strict";
define(['Foo'], function(Parent) {
    // We import Foo with the name "Parent" because we inherit from it.
    // This is must be done within the Metapolator code base.
    
    /**
     * This is the Constructor
     * usage: var bar = new Bar(51)
     * bar.echo()
     * > This barish Bar has a value of 51
     * bar.setValue(66);
     * bar.getValue();
     * > 66
     * bar.value = 77
     * bar.echo()
     * > This barish Bar has a value of 77
     * bar.value === bar.getValue()
     * true
     */
    function Bar(value) {
        // run the Parent constructor
        Parent.call(this, value)
    }
    // This is the actual inheritance!
    // Object.create allows us to not invoke the Constructor Parent here.
    var _p = Bar.prototype = Object.create(Parent.prototype);
    
    // There is another pattern for older Browsers without Object.create:
    //    var _Temporary = function(){}
    //    _Temporary.prototype = Parent.prototype
    //    value.prototype = new _Temporary()
    // Or use the polyfill at:
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/create
    
    _p._KIND = 'barish Bar'
    
    _p.setValue = function(newValue){
        // validate ...
        this._value = newValue;
    }
    
    _p.getValue = function(){
        return this._value;
    }
    
    // or add getters and setters
    Object.defineProperty(_p, 'value', {
        get : function(){ return this._value; },
        set : function(newValue) {
             // validate ...
            this._value = newValue;
        }
    }
    
    // export the 'class' as the module
    return Bar;
})

```


Todo:
 * describe a pattern for Mixins
 * show how *NOT* to use the `var self = this;` pattern (using `Function.prototype.bind()`)
 * Make a rule that allows nested function definitions only occasionally:
   For currying or when the closure scope matters (more?)
