Metapolator Installation
========================

See the [wiki](https://github.com/metapolator/metapolator/wiki) for developer documentation.

## Install

```
# clone the repository
$ git clone --recursive git@github.com:metapolator/metapolator.git
$ cd metapolator

# load the NodeJS dependencies
$ npm install
```

## Command-line interface

I recommend you to put the metapolator command on your PATH. However if
you don't do so you can run the metapolator commandline tools using the
path to the metapolator command:

```
$ mkdir ~/metapolator_tests
$ cd ~/metapolator_tests
~/metapolator_tests$ ~/path/to/metapolator/metapolator

Available command names are:
 - init
 - import
 - export
 - dev-playground-cps
 - dev-playground-cps-selectors
 - dev-playground-cps-algebra
Type "metapolator help <command name>" for further information.
Type "metapolator help" for this message.

# create your first project test.ufo
~/metapolator_tests$ ~/path/to/metapolator/metapolator init test
$ ls
test.ufo

# import a ufo. IMPORTANT: The outlines of this ufo should be preparead
# as 'strokes':
#  - even number of points per contour otherwise we skip it
#  - more than 3 points per contour otherwise we skip it
#  - the first point should be the first right outline point of your
#    stroke contour otherwise the skeleton gets imported scrumbled
~/metapolator_tests$ cd test.ufo
~/metapolator_tests/test.ufo$ ~/path/to/metapolator/metapolator init import ~/path/to/font.ufo first_master

# your current metapolator project directory tree (if you imported a font
# with the glyphs a and e)
~/metapolator_tests/test.ufo$ tree
.
├── data
│   └── com.metapolator
│       ├── cps
│       │   ├── default.cps
│       │   ├── first_master.cps
│       │   └── global.cps
│       └── project.yaml
├── glyphs
│   └── contents.plist
├── glyphs.skeleton.first_master
│   ├── a.glif
│   ├── contents.plist
│   └── e.glif
├── layercontents.plist
└── metainfo.plist

# this is a good point to start playing with the metapolator project data
# we will create a first steps tutorial soon.
# have a look at data/com.metapolator/project.yaml you can setup new
# masters in that file by copying the data of first_master.

# export first_master to ../export.ufo
~/metapolator_tests/test.ufo$ ~/path/to/metapolator/metapolator export first_master ../export

# also, at this point you can start the metapolator red-pill GUI server from within
# the project that you want to serve. NOTE: that at this point the GUI won't let you
# save changes, but it is a good way to experiment with CPS
# Here is a short screencast: https://plus.google.com/101961686124685905596/posts/QghMpxt5NpL

~/metapolator_tests/test.ufo$  ~/path/to/metapolator/metapolator red-pill

# Open http://localhost:3000 in your browser.

```

## Run the testsuite:

```
# run the testsuite, if you enjoy writing tests, we appreciate help much!
# also, we need to test more:
~/path/to/metapolator$ ./runtest.sh 
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
# you wont see a lot here

# start the server:
~/path/to/metapolator$ ./serve.sh

# go to: http://localhost:8000
# you'll see a simple scene where you can add 'widgets' to a 'container'

```
