Metapolator Installation
========================

The simplest and recommended method is to use the [Vagrant](http://www.vagrantup.com) box, for which you also need [Virtualbox](http://www.virtualbox.org). In an empty directory, run the commands:

```
vagrant init metapolator/bleeding-edge
vagrant up
```

You can then `vagrant ssh` into the box, or `vagrant ssh -- COMMAND ARG...` to run a command on it.

If you prefer to install manually, see the provisioning script at the top of `vagrant/Vagrantfile`. It is written for Ubuntu 14.04, from which you can infer dependencies for other platforms (primarily: node 0.10).

# Usage

## Command-line interface

An example session:

```
$ mkdir metapolator_tests
$ cd metapolator_tests
/home/rrt/repo/metapolator-rrthomas/metapolator_tests
$ metapolator
Usage: metapolator [options] [command]

Commands:

   delete <[project/]master>                             delete the given master
   dev-playground-cps <cps-file>                         process the given CPS file
   dev-playground-cps-algebra <equation>                 insert a linear equation
   dev-playground-cps-selectors <master> <selectors>     run a comma-separated list of selectors on the given master
   export <[project/]master> <ufo>                       export a master to a UFO
   import <ufo> <[project]/master>                       import a UFO to a master
   init <name>                                           initialise a new project called <name>
   interpolate <masters> <proportions> <new-master>      interpolate a comma-separated list of masters according to a corresponding list of proportions
   red-pill [ufo]                                        open a UFO (default: current directory) in the red-pill web interface
   help <sub-command>                                    Show the --help for a specific command
$ metapolator init test.ufo
$ ls
test.ufo
$ metapolator import ../app/tests/lib/export/test-data/Sean_hairline-PAN.ufo ./test.ufo/first_master
importing ...
> importing glyph: P
WARNING: test this openContourOffCurveLeniency
WARNING: test this openContourOffCurveLeniency
    importing contour 0
    importing contour 1
> importing glyph: A
WARNING: test this openContourOffCurveLeniency
WARNING: test this openContourOffCurveLeniency
WARNING: test this openContourOffCurveLeniency
    importing contour 0
    importing contour 1
    importing contour 2
> importing glyph: N
WARNING: test this openContourOffCurveLeniency
WARNING: test this openContourOffCurveLeniency
WARNING: test this openContourOffCurveLeniency
    importing contour 0
    importing contour 1
    importing contour 2
Importing groups.plist into the project.
Import of groups.plist OK.

$ tree
.
└── test.ufo
    ├── data
    │   └── com.metapolator
    │       ├── cps
    │       │   ├── centreline-skeleton-to-symmetric-outline.cps
    │       │   ├── first_master.cps
    │       │   └── global.cps
    │       └── project.yaml
    ├── glyphs
    │   └── contents.plist
    ├── glyphs.skeleton.first_master
    │   ├── A_.glif
    │   ├── contents.plist
    │   ├── N_.glif
    │   └── P_.glif
    ├── groups.plist
    ├── layercontents.plist
    └── metainfo.plist

6 directories, 12 files
$ metapolator export ./test.ufo/first_master export.ufo
exporting ...
exporting P
It is deprecated to use Vectors for dir0 or dir1
It is deprecated to use Vectors for dir0 or dir1
It is deprecated to use Vectors for dir0 or dir1
It is deprecated to use Vectors for dir0 or dir1
It is deprecated to use Vectors for dir0 or dir1
It is deprecated to use Vectors for dir0 or dir1
It is deprecated to use Vectors for dir0 or dir1
It is deprecated to use Vectors for dir0 or dir1
It is deprecated to use Vectors for dir0 or dir1
It is deprecated to use Vectors for dir0 or dir1
exporting A
It is deprecated to use Vectors for dir0 or dir1
It is deprecated to use Vectors for dir0 or dir1
It is deprecated to use Vectors for dir0 or dir1
It is deprecated to use Vectors for dir0 or dir1
It is deprecated to use Vectors for dir0 or dir1
It is deprecated to use Vectors for dir0 or dir1
exporting N
It is deprecated to use Vectors for dir0 or dir1
It is deprecated to use Vectors for dir0 or dir1
It is deprecated to use Vectors for dir0 or dir1
It is deprecated to use Vectors for dir0 or dir1
It is deprecated to use Vectors for dir0 or dir1
It is deprecated to use Vectors for dir0 or dir1

$ metapolator red-pill ./test.ufo
Metapolator: Serving the red pill.
Open http://localhost:39250 in your browser.
```

NOTE: the GUI won't yet let you save changes, but it is a good way to experiment with CPS. There is a short [screencast](https://plus.google.com/101961686124685905596/posts/QghMpxt5NpL) of an early version.

Have a look at data/com.metapolator/project.yaml: you can set up new masters in that file by copying the data of first_master.

## Run the testsuite:

```
# run the testsuite, if you enjoy writing tests, we appreciate help much!
# also, we need to test more:
$ npm test
> metapolator-next@0.0.0 test /path/to/metapolator
> ./runtest.sh

/path/to/metapolator/app
Defaulting to "console" reporter
PASS: main - Metapolator - Metapolator_Constructor (2ms)
1/1 tests passed
PASS: main - CPS dataTypes Algebra - CPS_Algebra_vs_eval (6ms)
1/1 tests passed
PASS: main - MOM _Node - Node_Constructor (1ms)
PASS: main - MOM _Node - Node_add (2ms)
PASS: main - MOM _Node - Node_find (0ms)
PASS: main - MOM _Node - Node_remove (1ms)
PASS: main - MOM _Node - Node_qualifiesAsChild (0ms)
PASS: main - MOM _Node - Node_children (1ms)
PASS: main - MOM _Node - Node_parent (1ms)
7/7 tests passed
PASS: main - MOM relationship - Node_ (1ms)
1/1 tests passed
10/10 tests passed

------------------------------+-----------+-----------+-----------+-----------+
File                          |   % Stmts |% Branches |   % Funcs |   % Lines |
------------------------------+-----------+-----------+-----------+-----------+
   lib/                       |     89.29 |        48 |        80 |     88.89 |
      Metapolator.js          |       100 |       100 |       100 |       100 |
      errors.js               |     85.37 |     43.48 |     66.67 |        85 |
   lib/models/                |       100 |       100 |       100 |       100 |
      _BaseModel.js           |       100 |       100 |       100 |       100 |
   lib/models/CPS/dataTypes/  |     89.71 |     76.81 |     82.76 |      89.6 |
      algebra.js              |     89.71 |     76.81 |     82.76 |      89.6 |
   lib/models/MOM/            |     86.84 |     67.39 |     72.13 |     86.11 |
      Glyph.js                |     77.78 |       100 |        60 |     76.47 |
      Master.js               |       100 |       100 |       100 |       100 |
      PenStroke.js            |       100 |       100 |       100 |       100 |
      PenStrokePoint.js       |     83.33 |       100 |     42.86 |     82.61 |
      PenStrokePointCenter.js |       100 |       100 |       100 |       100 |
      PenStrokePointLeft.js   |       100 |       100 |       100 |       100 |
      PenStrokePointRight.js  |       100 |       100 |       100 |       100 |
      Univers.js              |       100 |       100 |       100 |       100 |
      _Contour.js             |        90 |        50 |       100 |     88.89 |
      _Node.js                |        80 |     68.18 |        56 |     79.61 |
      _PenStrokePointChild.js |       100 |       100 |       100 |       100 |
------------------------------+-----------+-----------+-----------+-----------+
All files                     |     88.39 |     68.57 |      76.7 |     87.95 |
------------------------------+-----------+-----------+-----------+-----------+

# running the tests in the browser will be supported, too.

```

## In the browser

```
# this is only preparation for the browser interface using angularJS
# you won't see a lot here

# start the server:
$ ./serve.sh

# go to: http://localhost:8000
# you'll see a simple scene where you can add 'widgets' to a 'container'

```

# Preparing fonts for import

The outlines should be preparead as _strokes_:

* even number of points per contour otherwise we skip it
* more than 3 points per contour otherwise we skip it
* the first point should be the first right outline point of your stroke contour otherwise the skeleton gets scrambled

TODO: create a first steps tutorial

# Development tools

Partial support for code navigation with [TernJS](http://ternjs.net) is available. See `make-tern-project` in the top-level directory to create a suitable `.tern-project` file.

For debugging the command-line interface or server code, [node-inspector](https://github.com/node-inspector/node-inspector) is good.