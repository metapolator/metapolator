
Metapolator Install
===================

These install instructions are for developers. There are live demos at the
Metapolator project site: [http://metapolator.com](http://metapolator.com)


Prerequisites
-------------

Expect you to have the following software installed:

- Git
- Node.js and it's build in Node Package Manager (npm)
- Node Version Manager (nvm)

For more information:

- https://git-scm.com/
- https://nodejs.org
- https://github.com/creationix/nvm


Get the code
------------

Clone the Metapolator repository with the `--recursive` flag. This will also 
clone the needed submodules:

    $ git clone --recursive  git@github.com:metapolator/metapolator.git


If you have the code already but forgot about the submodules, then get the
submodules with:

    $ cd metapolator
    $ git submodule update --init --recursive


Install
-------

Make metapolator your current directory:

    $ cd metapolator


To download, compile and install the latest v0.10.x release of node:

    $ nvm install 0.10

Next time you can just use the right node version:

    $ nvm use 0.10

Double check the node version:

    $ node --version
    v0.10.xx

Install:

    $ npm install

Test:

    $ npm test


Start Metapolator
-----------------

Metapolator is both a command line interface and a graphical user interface
`metapolator` lives in bin. For all possible commands:

    $ bin/metapolator help


Initialise a new project. This creates an Unified Font Object (UFO):

    $ bin/metapolator init myfont


Start serving Metapolator GUI:

    $ bin/metapolator serve -p 8080 myfont


Open `127.0.0.1:8080` in a browser. Note: Firefox works out of the box. If you
are using Chromium (or Google Chrome), you should run it as:

    $ chromium --js-flags="--harmony_proxies"


The graphical user interface will be visible. Note that `myfont` doesn't contain
glyphs. But we confirmed that the GUI works! Stop te server (Ctrl + C) and try 
the example font named `Canola`:

    $ bin/metapolator serve -p examples/Canola-min


You might need to delete the `.git` in `Canola-min` directory. See
https://github.com/metapolator/metapolator/issues/634

    $ rm -r examples/Canola-min/.git
