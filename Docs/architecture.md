Metapolator's Architecture
==========================

This page documents Metapolator's architecture. It is the starting point for new contributors. A solid architecture is the foundation of a robust and extensible application, which Metapolator aims to be.

Concerns
---------
Metapolator can be divided into two main concerns:

 * Provide font technology
 * Provide (a web-)interface(s) to that technology

These concerns fundamentally determine the software's structure.

### The Font Technology

Can be provided via different interfaces (GUI, API, CLI, etc.) but should
itself be independent from these interfaces. You won't need a web-browser
to use a command line interface.

We are moving towards providing as much as possible of the font-technology
in JavaScript, so it can be used by other web projects, too. To make that
technology useful in a wider range of tasks, such as automated built processes,
we aim to eventually support non-web JavaScript too. Currently rather
focused on NodeJS, but SpiderMonkey could be a target for the future, too.

### The Web Interface

Metapolator is an application with focus on the web browser as a platform.
Because Metapolator is built for the future we use latest web standards
as supported by the latest browsers—Chrome and Firefox are our targets
because they lead the development of the web platform.

We use well known, well documented libraries and provide our own documentation
on top of it (starting with this document).

The main user interface Libraries include:

 * [AngularJS](https://angularjs.org/) which we treat as our GUI toolkit for the
   Web
 * [{less}](https://lesscss.org) and [Bootstrap](http://getbootstrap.com/)
   for a powerful and flexible styling workflow that can run in the browser.

Modules, Separation of Concerns and Hierarchy
---------------------------------------------

Metapolator is going to be a large and complex project.
To be prepared for all kinds of challenge and to reduce complexity,
we define strict patterns and best practices.

Main challenges include:
 
 1. stay maintainable
 * enable custom and complex interfaces
 * be always ready to add new features
 * allow 3rd party code when it doesn't affect overall stability

One main approach is to structure our code into modules. Each module is very limited in what it does and what
it knows. So its easy to add features or to locate Errors and we limit the range of influence failure can have to the system.

### Hierarchy

Modules are organized in a hierarchical way from *more general/managing* 
to *more specialized/actually doing something*. **This Hierarchy is reflected
in the directory structure of our code.** As a guideline: interaction between
modules follows the edges of the hierarchy graph. This implies the
[Law of Demeter](http://en.wikipedia.org/wiki/Law_of_Demeter) (LoD), or
principle of least knowledge. However for good reason we'll break this
rule occasionally, because it can lead to bloated interfaces. Modules can call those below them in the hierarchy directly, but for better decoupling, a callback or event mechanism should be used when a lower module needs to call a higher.

### Some rules for Modules

 * Each module defines public interfaces that can be used by other modules.
 * We use [Asynchronous Module Definition](http://requirejs.org/docs/whyamd.html)
   to structure our code. In the web we use [RequireJS](http://requirejs.org) as
   a loader.
 * AMD allows us to declare and see the dependencies of our modules at
   the top of each file.
 * Non-AMD **3rd party code** is included in a way that allows us to describe
   dependencies to that code in the same fashion: via RequireJS shim
   configuration or mock-up modules. However, 3rd party code must be in a
   reasonable state and pass our review.
 * **We never use anything without
   declaring the dependency**. This excludes JavaScript language features.
 * [Web-APIs](https://developer.mozilla.org/en-US/docs/Web/API) and their
   instances on `window` (the global namespace object in web browsers),
   like `document` may be considered as available in the frontend branch
   (the `app/lib/ui` directory), but not in other code. However, best practice
   is to require mock-up modules to these APIs wherever they are used. *So
   we can provide replacements in non-browser environments like NodeJS*.
   We use the `app/lib/webAPI` directory for these mock-ups.

Macro Directory Structure
-------------------------
```
.                               root
├── app/                        All code is in here
│   ├── index.html              entry point for your browser/ some setup
│   ├── lib/                    our none-AngularJS code (font-technology)
│   │   ├── bower_components/   3rd party libraries, managed by bower
│   │   ├── main.js             bootstrapping Metapolator
│   │   ├── Metapolator.js      main controller of the whole app
│   │   ├── models/             data model/complex stuff
│   │   ├── webAPI/             mock-up modules to declare dependencies to
│   │   └── ui/                 user interface/AngularJS code see: AngularJS
│   │                           integration
│   └── tests/                  automated tests of all kinds
├── bower.json                  frontend dependencies
├── docs/                       documentation, the origin of this file
├── (node_modules)              create by npm 'install' using package.json
├── package.json                dependencies for the server/development
├── README.md                   Project overview
├── runtest.sh                  unit-tests using nodeJS
└── serve.sh                    simple server for development
```


AngularJS integration
---------------------
For modeling the AngularJS part I followed some recommendation on the web
particular influential was:
[An AngularJS Style Guide for Closure Users at Google](https://google-styleguide.googlecode.com/svn/trunk/angularjs-google-style.html)
except that we use RequireJS for module loading and hence have some differences 
stemming from that.

A first draft of the directory structure follows. However, this is just
a mock-up yet, to test the concept and to explain the design:

```
.
├── app-controller.js
├── app-directive.js
├── app.js
├── app.less
├── app.tpl
├── container
│   ├── container-controller.js
│   ├── container-directive.js
│   ├── container.js
│   ├── container.less
│   └── container.tpl
└── widget
    ├── widget-controller.js
    ├── widget-directive.js
    ├── widget.js
    ├── widget.less
    └── widget.tpl
```
### some rules for our AngularJS code are:

* we keep all parts of an angular module together in one directory
* each part of an angular module has its own file
* **We have naming conventions for these files *AND* by looking inside of
  these files we'll detect *even more* naming conventions**
* the angular module is defined in `<modulename>.js`
* templates are in `<modulename>.tpl` files and we use RequireJS to
  pull these into the app.
* we use **mtk-** as prefix for our self-defined tags/directives
  (mtk = **M**etapolator **T**ool**K**it)
* we use less for styling but **we don't use RequireJS to include the less
  files** because the less `@import` mechanism is a mighty tool that helps
  us to reuse variables, mixins and whatnot.
  
### AngularJS <==> Business Logic
There will be some touching points between our business logic and
AngularJS. The tightest coupling will be with our data-model. AngularJS
will provide the *View* on our model and the Controls to change the model.
Therefore we'll need to define and constantly refine the API of our model.
When the model changes, AngularJS will react on that.

Other communications with our business logic and AngularJS will be provided
via the AngularJS services API (`module.constant|value|service` etc.).

When our business logic changes the model it is in some cases mandatory
to inform AngularJS of that, so it updates the views. It all boils down to
run `$scope.$apply()` or `$scope.$digest()` in one or the other way.
We will have to document here or in the yet to come Model-Documentation
how this has to happen.
Until there is a better plan, we use the `metapolator.frontend.redraw`
method. We use this extensively and no another way. When the time comes
that we need a more robust/less resource hungry interface we'll have it
easy to spot the use cases and to create a proper replacement.

Testing
-------

Testing is done by [The Intern](http://theintern.io/), because:

 * Asynchronous Module Definition by default
 * run tests using the browser, node.js, Selenium, PhantomJS … whatnot
 * integrates with TravisCI
 * Code Coverage is builtin
 * A Grunt Task is available
