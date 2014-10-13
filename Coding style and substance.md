## Code formatting

* 4 spaces for indenting
* No tabs
* Keep files whitespace clean, but don't clean up lines you don't edit
* In general, copy the style you find.

## Emacs

If you are using Emacs then you might find the following code useful in your init file.

```lisp
;; ensure that commands are shown with correct highlighting.
(add-to-list 'interpreter-mode-alist '("nodejs" . js-mode))
(add-to-list 'interpreter-mode-alist '("node" . js-mode))
(add-to-list 'auto-mode-alist '("\\.cps\\'" . css-mode))
```

## Variable declaration

Multiple variable declarations should look like this:

```js
var i = 0
  , j
  , obj = new Foo()
  ;
```

## Inheritance

### Class-like inheritance

This is the definitive guide to how class like structures should be written in Metapolator. A lot of people don't learn to do this in JavaScript (some even believe inheritance doesn't exist in JavaScript).

I embed the examples into AMD/RequireJS modules, because this is how we
will encounter classes in Metapolator.

This guide is by no means complete! I know that these examples don't show
everything. I will extend this occasionally. So please, if you have
questions or find flaws, file an issue.

```js
// file Foo.js
define([], function() {
    "use strict";
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
#### Let's do inheritance
JavaScript uses prototype-based inheritance. This is a pattern that allows a lot of things, but also it makes some things harder to do right. One of the latter is a system of inheritance that behaves like a class-based inheritance system.

The main difficulty is that in Javascript the `new` keyword does two things. A) it creates a new object using the `.prototype` property of the constructor function as prototype for the new object B) it invokes the constructor function—bound to the newly created object—which sets initial state properties.

This is fine when you want to create a new instance of a "class" to use right away, but it falls short when setting up a system of inheritance. In the following, the two tasks of the new keyword are replaced by:

* *Object.create(Parent.prototype)*: does only A)
* *Parent.call(this)*: inside of the child constructor does only B)


```js
// file Bar.js
define(['Foo'], function(Parent) {
    "use strict";
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

### Static inheritance

```js
// file staticParent.js
define(["metapolator/errors"], function(errors) {
    "use strict";
    /**
     * The static parent class, it defines for example an interface, but
     * it needs no per-instance state. It can be just an object with a
     * collection of methods.
     */
    return {
        /**
         * Description of the expected behavior of the do interface.
         */
        do: function(arg) {
            throw new errors.NotImplemented('implement "do" in a deriving object');
        }
      , somethingGeneric: function() {
          ...
      }
    }
})


// file staticParent.js
define(["./StaticParent"], function(parent) {
    "use strict";
    // the most straightforward way to inherit from parent
    var staticChild = Object.create(parent);
    
    staticChild.do = function(arg) {
        // do something
        
        // somethingGeneric is available here
        this.somethingGeneric();
    }
    
    return staticChild;
    
    // note that child could also be not static and provide a Constructor
    // but then, our `staticChild` would become the prototype of that
    // Constructor
})
```

## Function Modules

Modules that contain just a collection of functions:

```js
stuff.js
define([], function() {
    "use strict";
    
    /**
     * Creating named functions has some benefits:
     *   - In many interpreters the function’s `name` property is set to 
     *     the name of the function, which can be handy for debugging.
     *     `function hello(){}.name === 'hello'`
     *     This can also be used to get an object’s constructor’s name
     *     `object.constructor.name` but for some cases it might be useful
     *     to have this available for functions, too.
     *   - You can reference such a function before it is declared, the
     *     parser knows how to handle that.
     */
    function writeStuff(){}
    function readStuff(){
        _doPrivateThings();
    }
    
    /**
      * Usually you wouldn't export private functions, we use the underscore
      * nonetheless, so it's clear that the method is not intended as a 
      * public interface
      */
    function _doPrivateThings(){}
    
    /**
     * The module will have a name itself, so it's OK to account for that
     * in the exported names: e.g. `writeStuff` will be used as `stuff.write`
     */
    return {
        write: writeStuff
      , read: readStuff
    }
})
```
## Errors and exception-handling

We don't have yet decided a general strategy to cope with every *generic*
error (like a central logging or such). So what we do instead is catching
and handling at any instance only *specific* errors, when we know how to 
deal with them.

This means that we know that errors will be thrown and that these errors
sometimes even end our process. This is actually a good thing, because
then we can think about how to handle these errors appropriately. This is
also important as a quality assurance, because it helps us to detect the 
exceptional cases where we need to put additional work in.

```js
// DON'T DO THIS ANYWHERE
// Errors are like very good friends, they show us honestly where things
// go wrong. So we owe them some respect. If an error is thrown, a sub-
// system tells us that it can't operate anymore. Just going on in any 
// possible case is clearly wrong, because it's above our understanding
// what the reasons for the wrong going might have been.
try {
    // do something
}
catch(error) {
    console.log(error);
}

// DO THIS
define([
     /**
     * We use central modules to distribute errors across our project.
     * Have a look at these modules to know what is defined so far.
     *
     * Third party code may have something similar or not. We'll have to 
     * deal with that creatively
     */
    'metapolator/errors'
  , 'ufojs/errors'
  , 'ufojs/tools/io/static'
], function(
    errors
  , ufojsErrors
  , io
) {
    /**
     * You can refer to the errors via their module object directly or 
     * you can create a shortcut at the top of the file. The latter 
     * providers a nice overview, so that is preferred.
     */
    var IOError = ufojsErrors.IO
      , IONoEntryError = ufojsErrors.IONoEntry
      , KeyError = errors.Key
      ;
    try {
        // Do something, you can even return inside of a try{}
    }
    catch(error) {
        /**
         * We are pretty free in how we write the code in here, important
         * is that we only handle specific errors and re-throw everything
         * else.
         * 
         * If we handle all errors without distinction, a message about 
         * the reasoning behind that should be provided
         *
         * see the use of `instanceof`, this allows us to handle the collected
         * errors of some specific subsystem at once, if they are defined
         * accordingly.
         */
        if(!(error instanceof IOError) && !(error instanceof KeyError)) {
            throw error;
        }
        /**
         * Handle IOError and KeyError
         *
         * maybe a console.warn() is OK here, maybe not
         * We currently use console.warn as a marker. For a stable
         * release we'll probably prepare a replacement. But using
         * console.{error|warn} is good, because it helps us to
         * `grep` for it and both write to stderr, which allows us to use
         * stdout for commandline tasks.
         */
    }
    
    
    // The other way around may be an option for you, too:
    try {
        // do something, you can even return inside of a try{}
    }
    catch(error) {
        if(error instanceof IOError) {
            // handle IOError
        }
        else if(error instanceof KeyError) {
            // handle KeyError
        }
        throw error;
    }
    
    /** Another very good case for error handling is using IO: **/

    // DON'T DO THIS
    /**
     * BAD because
     *    A) io.readFile may still fail when we got into a race condition
     *    B) we need two calls to IO which is rather costly
     */
    if( io.pathExists( false, 'path/to/file'))
        var data = io.readFile(false, 'path/to/file');
    else
        do_something_about_that_missing_file();
    
    // INSTEAD DO THIS
    try {
        var data = io.readFile(false, 'path/to/file');
    }
    catch(error) {
        if(!(error instanceof IONoEntry))
            throw error;
        do_something_about_that_missing_file();
    }
})
```

Todo:

 * describe a pattern for Mixins
 * show how *NOT* to use the `var self = this;` pattern (using `Function.prototype.bind()`)
 * Make a rule that allows nested function definitions only occasionally:
   For currying or when the closure scope matters (more?)

# ES6

In one or two places we need some of the future goodness that is ES6. Some features are already supported by node and major browsers; for the rest we use [regenerator](https://github.com/facebook/regenerator). Currently we've not found a way to use it on the fly with RequireJS, and since node 0.12 should support the features we need and render the translation obsolete, there's little point trying further. Hence temporarily there's a script `es6to5` in the top-level directory which should be used to translate any `.es6.js` to the corresponding `.js` every time it is edited.
