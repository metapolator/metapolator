# How To Contribute To Metapolator

The Metapolator project welcomes new contributors.

We're looking forward to accepting your contributions to this project, from idea to a code contribution that is implemented and shipping in the product.
When we do, you'll be added to the _contributors_ Github team and given commit-access to the project. 

## Code of Conduct

This Code of Conduct is adapted from [Node's CoC](https://github.com/nodejs/node/blob/master/CONTRIBUTING.md#code-of-conduct).

* We are committed to providing a friendly, safe and welcoming environment for all, regardless of gender, sexual orientation, disability, ethnicity, religion, or similar personal characteristic.
* Please avoid using that might detract from a friendly, safe and welcoming environment for all.
* Please be kind and courteous. There's no need to be mean or rude.
* Respect that people have differences of opinion and that every design or implementation choice carries a trade-off and numerous costs. There is seldom a right answer.
* Please keep unstructured critique to a minimum. If you have solid ideas you want to experiment with, make a fork and see how it works.
* We will exclude you from interaction if you insult, demean or harass anyone. That is not welcome behavior. We interpret the term "harassment" as including the definition in the [Citizen Code of Conduct](http://citizencodeofconduct.org/); if you have any lack of clarity about what might be included in that concept, please read their definition. In particular, we don't tolerate behavior that excludes people in socially marginalized groups.
* Private harassment is also unacceptable. No matter who you are, if you feel you have been or are being harassed or made uncomfortable by a community member, please contact Lasse Fister or Dave Crossland immediately with a capture (log, photo, email) of the harassment if possible. Whether you're a regular contributor or a newcomer, we care about making this community a safe place for you and we've got your back.
* Likewise any spamming, trolling, flaming, baiting or other attention-stealing behavior is not welcome.

### 1\. Discuss! 

First step is to propose what you want to do, so that other members of the community can help your ideas fit into the architecture and schedule of the project.

If you have an idea or question, chat with us on our [G+ Community Page](https://plus.google.com/communities/110027004108709154749). Discussion of non-technical topics like licensing, trademarks or any other high-level project questions are best done here.

If you have a concrete set of development tasks already formed, [file an issue](https://guides.github.com/features/issues/) outlining them. 

We have a detailed interaction architecture plan (on [our wiki](https://github.com/metapolator/metapolator/wiki/interaction-design)), and [milestones](https://github.com/metapolator/metapolator/milestones) that we are following to build this product. 
So it is possible that if you run ahead, your ideas could go to waste if they don't fit smoothly into the project. 
We don't want that, we want you to become an active part of this adventure!

You might not want to prematurely address the community via the issue tracker with a detailed proposal, and instead explore your ideas by prototyping them. 
Surely this risks wasting their time prototyping stuff that doesn't fit and is never merged. 
On the other hand, you just as surely risk wasting time in conceptual discussions that turn out to lead to dead ends because they weren't put into practice and tested soon enough. 
Or the discussions lose sight of whats important and become centered around initial details and descend into bike-shedding. 

The balance of those risks is up to us all to keep steady. 
When you drop a note on the issue tracker, we'll take your ideas seriously. 

### 2\. Prototype! 

Nothing is better than taking action and making your ideas real. 
After you're satisfied that your ideas will be accepted, please plough ahead! 
Some things can fit in a <http://jsbin.com> prototype, while others will need to live in your fork of Metapolator.
Please see our Code Style guidelines, below.

### 3\. Pull Request!

When your prototype is ready to consider for inclusion in the next release, make a [pull request](https://help.github.com/articles/using-pull-requests/).

#### Step 1: Fork

Fork the project [on GitHub](https://github.com/metapolator/metapolator) and check out your copy locally.

```text
$ git clone git@github.com:username/metapolator.git;
$ cd metapolator;
$ git remote add upstream git://github.com/metapolator/metapolator.git;
```

For developing new features and bug fixes, the `master` branch should be pulled and built upon.

#### Step 2: Branch and Commit

Create a feature branch and start hacking:

```text
$ git checkout -b my-feature-branch -t origin/master
```

Make sure git knows your name and email address before committing anything:

```text
$ git config --global user.name "J. Random User"
$ git config --global user.email "j.random.user@example.com"
```

Writing good commit logs is important. 
A commit log should describe what changed and why. 
Follow these guidelines when writing one:

1. The first line should be 50 characters or less and contain a short description of the change prefixed with the name of the changed subsystem (e.g. "net: add localAddress and localPort to Socket")
2. Keep the second line blank
3. Wrap all other lines at 72 columns

A good commit log can look something like this:

```
subsystem: explaining the commit in one line

Body of commit message is a few lines of text, explaining things
in more detail, possibly giving some background about the issue
being fixed, etc. etc.

The body of the commit message can be several paragraphs, and
please do proper word-wrap and keep columns shorter than about
72 characters or so. That way `git log` will show things
nicely even when it is indented.
```

The header line should be meaningful; it is what other people see when they
run `git shortlog` or `git log --oneline`.

Check the output of `git log --oneline files_that_you_changed` to find out
what subsystem (or subsystems) your changes touch.

#### Step 4: Rebase

Use `git rebase` (not `git merge`) to sync your work from time to time.

```text
$ git fetch upstream
$ git rebase upstream/master
```

#### Step 5: Test

Bug fixes and features **should come with tests**. 
Add your tests in the `app/tests/` directory. 
Look at other tests to see how they should be structured (license boilerplate, common includes, etc)

Run the tests as standard with npm:

```text
$ git clone --depth=50 https://github.com/metapolator/metapolator.git metapolator/metapolator
$ cd metapolator/metapolator
$ git submodule init
$ git submodule update
$ nvm install 0.10
$ npm install 
$ npm test
```

#### Step 6: Push and Pull Request

```text
$ git push origin my-feature-branch
```

Go to https://github.com/yourusername/metapolator and select your feature branch, then click the 'Pull Request' button and fill out the form.

Pull requests are usually reviewed within a few days. 
If there are comments to address, apply your changes in a separate commit and push that to your feature branch. 
Post a comment in the pull request afterwards; GitHub does not send out notifications when you add commits.

By making a contribution to the project, you certify that:

1. The contribution was created in whole or in part by me and Ihave the right to submit it under the open source license indicated in the file; or
2. The contribution is based upon previous work that, to the best of my knowledge, is covered under an appropriate open source license and I have the right under that license to submit that work with modifications, whether created in whole or in part by me, under the same open source license (unless I am permitted to submit under a different license), as indicated in the file; or
3. The contribution was provided directly to me by some other person who certified (a), (b) or (c) and I have not modified it.

### 4\. Credit!

After your pull request is merged, you should be listed in the CONTRIBUTORS and/or AUTHORS files. 
CONTRIBUTORS is the official list of people who can contribute (and typically have contributed) code to this repository, while the AUTHORS file lists the copyright holders.

# Coding Style and Substance

#### Code formatting

* 4 spaces for indenting
* No tabs
* Keep files whitespace clean, but don't clean up lines you don't edit
* In general, copy the style you find.

#### Emacs

If you are using Emacs then you might find the following code useful in your init file.

```lisp
;; ensure that commands are shown with correct highlighting.
(add-to-list 'interpreter-mode-alist '("nodejs" . js-mode))
(add-to-list 'interpreter-mode-alist '("node" . js-mode))
(add-to-list 'auto-mode-alist '("\\.cps\\'" . css-mode))
```

#### Variable declaration

Multiple variable declarations should look like this:

```js
var i = 0
  , j
  , obj = new Foo()
  ;
```

### Inheritance

##### Class-like inheritance

This is the definitive guide to how class-like structures should be written in Metapolator. 
A lot of people don't learn to do this in JavaScript (and some even believe inheritance doesn't exist in JavaScript.)

Here the examples are embedded into AMD/RequireJS modules, because this is how you will encounter classes in Metapolator.

This guide is by no means complete! 
These examples don't show everything, and will be extended occasionally. 
So please, if you have questions or find flaws, file an [issue](https://github.com/metapolator/metapolator/issues).

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

##### Let's do inheritance

JavaScript uses prototype-based inheritance. 
This is a pattern that allows a lot of things, but also it makes some things harder to do right. 
One of the latter is a system of inheritance that behaves like a class-based inheritance system.

The main difficulty is that in Javascript the `new` keyword does two things: 
(A) it creates a new object using the `.prototype` property of the constructor function as prototype for the new object, 
and (B), it invokes the constructor function—bound to the newly created object—which sets initial state properties.

This is fine when you want to create a new instance of a "class" to use right away, but it falls short when setting up a system of inheritance. 
In the following, the two tasks of the new keyword are replaced by:

* *Object.create(Parent.prototype)*: does only (A)
* *Parent.call(this)*: inside of the child constructor does only (B)

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

##### Static inheritance

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
        // when using `this` be careful of the context in
        // that your module is used!
        // works in this context:
        //    staticChild.do()
        // fails in this context:
        //     var do = staticChild.do;
        //     do();
    }
    
    return staticChild;
    
    // note that child could also be not static and provide a Constructor
    // but then, our `staticChild` would become the prototype of that
    // Constructor
})
```

### Function Modules

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

### Errors and exception-handling

We have not yet decided a general strategy to cope with every *generic* error (like a central logging system, or such.)
So what we do instead is catching and handling only *specific* errors, when we know how to deal with them.

So you can expect that errors will be thrown, and that these errors sometimes even end our process. 
This is actually a good thing, because then we can think about how to handle these errors appropriately. 
It works as a kind of quality assurance process, because it helps us to detect the exceptional cases where we need to put additional work in.

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

### IO

Always remember, even though you might be writing code for a shell command at the moment, the code of Metapolator is intended to be executed in web browsers as well. 
One consequence of this is that we are using an IO abstraction layer that lets us change from a file system based backend to an XMLHTTPRequest/REST based backend. 
Some things may be totally fine when writing code for a local command, but they can become bad decisions when doing them in a browser via a HTTP connection.

Currently we are doing most of our IO in a synchronous fashion. 
This means that the user has to wait until the reading or writing of the data has finished: 
the program execution halts during that time, the interface is locked. 
The advantage for us is that we can focus on implementing the functionality but we'll have to pay the price later and refactor some of these situations. 
For client facing code, we will sooner or later have to either 
(A) add a mixed asynchronous/synchronous API, probably using
[obtainJS](https://github.com/graphicore/obtainJS) 
or (B) just convert the synchronous calls to asynchronous ones, probably based on ECMAScript 6 `Promises`.

Until then, if you need IO, we collect here a set of rules to make the upcoming conversion work less painful:

**Don't do IO in constructors.** 
It's expensive, especially when we are not going to read the data. 
We don't want to dig into each constructor to see if it does something expensive like IO. 
Also, when we move to more asynchronous IO calls: it is hard to create an asynchronous version of a constructor.
If you *really* need IO for construction, a factory function may be the way to go.

If you don't really need the result of your IO on load, it is maybe enough to lazy load the data using getters:

```
var _p = Constructor.prototype;
Object.defineProperty(_p, 'fileContents', {
    get: function() {
        return this._io.readFile(false, this.filePath);
    }
});

// if a cached version of the file's contents is needed:
Object.defineProperty(_p, 'fileContents', {
    get: function() {
        if(this._fileContents === undefined)
            this._fileContents = this._io.readFile(false, this.filePath);
        return this._fileContents;
    }
});
```

The getter pattern is still bad to "asynchronize". 
But at least the lazy loading of the data is given.

**Don't save file contents using a setter.** 
This is considered a unwanted side effect in almost all cases. 
Just make a method to save the data explicitly. 
Rather use setters to validate or sanitize data on input.

TODO:

 * describe a pattern for Mixins
 * show how *NOT* to use the `var self = this;` pattern, using `Function.prototype.bind()`
 * Make a rule that allows nested function definitions only occasionally, for currying or when the closure scope matters (more?)

### ES6

In one or two places we need some of the future goodness that is ES6. 
Some features are already supported by node and major browsers; for the rest we use [regenerator](https://github.com/facebook/regenerator). 
Currently we've not found a way to use it on the fly with RequireJS, and since node 0.12 should support the features we need and render the translation obsolete, there's little point trying further. 
Hence temporarily there's a script `es6to5` in the top-level directory which should be used to translate any `.es6.js` to the corresponding `.js` every time it is edited, for example:

    ./dev-scripts/es6to5  app/lib/project/ExportController.es6.js

## Further Reading

The contribution guide of nodejs covers most aspects of what we do pretty well: <https://nodejs.org/en/docs/>

There's also a textbook guide to collaborative libre licensed projects at <http://producingoss.com>
