## Code formatting

* 4 spaces for indenting
* No tabs
* Keep files whitespace clean, but don't clean up lines you don't edit
* In general, copy the style you find.

## Emacs

If you are using emacs then you might find the following code useful in your init file.

```lisp
;; ensure that commands are shown with correct highlighting.
(add-to-list 'interpreter-mode-alist '("nodejs" . js-mode))
(add-to-list 'interpreter-mode-alist '("node" . js-mode))
(add-to-list 'auto-mode-alist '("\\.cps\\'" . css-mode))
```

## Inheritance

This is the definitive guide to how class like structures should be written in Metapolator. A lot of people don't learn to do this in JavaScript (some even believe inheritance doesn't exist in JavaScript).

I embed the examples into AMD/RequireJS modules, because this is how we
will encounter classes in Metapolator.

This guide is by no means complete! I know that these examples don't show
everything. I will extend this occasionally. So please, if you have
questions or find flaws, file an issue.

```js
// file Foo.js
"use strict";
define([], function() {
    /**
     * This is the Constructor
     * usage: var foo = new Foo(12)
     */
    function Foo(value) {
        // underscore is our convention to mark a non-public interface
        this._value = value
        
        // **NEVER** define methods in here when you wan't to inherit
        // from them. use the prototype!
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
### Let's do inheritance
JavaScript uses prototype based-inheritance. This is a pattern that allows a lot of things, but also it makes some things harder to do right. One of the latter is a system of inheritance that behaves like a class-based inheritance system.
The main difficulty is that in Javascript the "new" keyword does two things. A) it creates a new object using the .prototype property of the constructor function as prototype for the new object B) it invokes the constructor function--bound to the newly created object--which sets initial state properties.

This is fine when you want to create a new instance of a "class" to use right away, but it fails short when setting up a system of inheritance. In the following, the two tasks of the new keyword are replaced by:

* *Object.create(Parent.prototype)*: does only A)
* *Parent.call(this)*: inside of the child constructor does only B)


```js
// file Bar.js
"use strict";
define(['Foo'], function(Parent) {
    // We import Foo with the name "Parent" because we inherit from it.
    // This is mandatory in Metapolator.
    
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
    // Object.create allows us to not invoke the Constructor Parent here,
    // which would probably instantiate state properties that are not meant
    // to be inherited. Instead, we are going to use Parent.call(this) in the
    // constructor. This will set the state properties in the new instance.
    var _p = Bar.prototype = Object.create(Parent.prototype);
    
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
