## Installing Metapolator via Vagrant

The simplest and recommended method is to use a [Vagrant](http://www.vagrantup.com) box, for which you also need [Virtualbox](http://www.virtualbox.org). 

On Mac OS X, run these commands to install vagrant:

```
# install homebrew, the package manager to install the following
ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)";
# install virtualbox, the virtual machine, to run vagrant
brew install Caskroom/cask/virtualbox;
# install vagrant
brew install Caskroom/cask/vagrant;
```

Then create a new and empty directory, run the commands:

```
mkdir ~/Documents/Metapolator;
cd ~/Documents/Metapolator;
vagrant init metapolator/bleeding-edge;
vagrant up;
```

You can then `vagrant ssh` into the box, or `vagrant ssh -- COMMAND ARG...` to run a command on it. 

Note that the Vagrant box can only see the directory in which it was created on the host machine: in the box this is `/vagrant`. (Symlinking into that directory won't work: UFOs and Metapolator projects have to be copied or hard-linked there.)

If you prefer to install manually, see the provisioning script at the top of `vagrant/Vagrantfile`. It is written for Ubuntu 14.04, from which you can infer dependencies for other platforms (primarily: node 0.10).

## Installation via npm

Metapolator can be installed as a Node module, for which you need [Node](http://nodejs.org/) and [git](http://git-scm.org/), then in your project directory run:

```
# install homebrew, the osx package manager to install the following
ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)";
# install npm, the node package manager
brew install npm;
# install metapolator
npm install metapolator/metapolator
```

# Usage

## Command-line interface

An example session (remembering first to `vagrant ssh`!):

```
vagrant ssh;
cd /vagrant/metapolator;
npm test;
mkdir metapolator_tests;
cd metapolator_tests;
metapolator;
metapolator init test.ufo;
ls;
metapolator import ../app/tests/lib/export/test-data/Sean_hairline-PAN.ufo ./test.ufo/first_master;
tree;
metapolator export ./test.ufo/first_master export.ufo;
metapolator red-pill ./test.ufo;
```

TODO: Running the tests in the browser will be supported, too. 

NOTE: the GUI won't yet let you save changes, but it is a good way to experiment with coding CPS.

Have a look at data/com.metapolator/project.yaml: you can set up new masters in that file by copying the data of first_master.

# Preparing fonts for import

The outlines should be prepared as "strokes":

* each contour must have an even number of cubic (PostScript) Bezier on-curve points, drawn in pairs
* each contour must have 6 or more Bezier on-curve points
* the first Bezier on-curve point should be the right-most point

TODO: create a first steps tutorial

# Development tools

Partial support for code navigation with [TernJS](http://ternjs.net) is available. See `make-tern-project` in the top-level directory to create a suitable `.tern-project` file, and discussion of support in https://github.com/metapolator/metapolator/issues/140

For debugging the command-line interface or server code, [node-inspector](https://github.com/node-inspector/node-inspector) is good.

TODO We need more tests! All contributions gratefully received; please list test ideas on new Github issues.