Metapolator Installation
========================

The simplest and recommended method is to use the [Vagrant](http://www.vagrantup.com) box, for which you also need [Virtualbox](http://www.virtualbox.org). In an empty directory, run the commands:

```
vagrant init metapolator/bleeding-edge
vagrant up
```

You can then `vagrant ssh` into the box, or `vagrant ssh -- COMMAND ARG...` to run a command on it. Note that the Vagrant box can only see the directory in which it was created on the host machine: in the VM, this is available under `/vagrant`. Symlinking into that directory won't work: UFOs and Metapolator projects have to be copied (or hard-linked) there.

If you prefer to install manually, see the provisioning script at the top of `vagrant/Vagrantfile`. It is written for Ubuntu 14.04, from which you can infer dependencies for other platforms (primarily: node 0.10).

# Usage

## Command-line interface

An example session (remembering first to `vagrant ssh`!):

```
$ cd /vagrant/metapolator
$ npm test

> metapolator-next@0.0.0 test /vagrant/metapolator
> cd app/tests; ./run_tests

./run_tests
PASS: main - Metapolator - Metapolator_Constructor (2ms)
1/1 tests passed
PASS: main - Export - Export_Constructor (6ms)
1/1 tests passed
PASS: main - CPS dataTypes formulaEngine - CPS_formulaEngine_vs_eval (28ms)
1/1 tests passed
PASS: main - CPS StyleDict - CPS_StyleDict_detect_recursion (171ms)
1/1 tests passed
PASS: main - MOM _Node - Node_Constructor (5ms)
PASS: main - MOM _Node - Node_add (1ms)
PASS: main - MOM _Node - Node_find (1ms)
PASS: main - MOM _Node - Node_remove (1ms)
PASS: main - MOM _Node - Node_qualifiesAsChild (1ms)
PASS: main - MOM _Node - Node_children (2ms)
PASS: main - MOM _Node - Node_parent (3ms)
7/7 tests passed
PASS: main - MOM relationship - Node_ (1ms)
1/1 tests passed
PASS: main - EcmaScript 6 direct proxies - Proxy_as_a_whitelist (6ms)
1/1 tests passed
13/13 tests passed

----------------------------------------------|-----------|-----------|-----------|-----------|
File                                          |   % Stmts |% Branches |   % Funcs |   % Lines |
----------------------------------------------|-----------|-----------|-----------|-----------|
   lib/                                       |     89.83 |        48 |        80 |     89.47 |
      Metapolator.js                          |       100 |       100 |       100 |       100 |
      errors.js                               |     86.67 |     43.48 |     66.67 |     86.36 |
   lib/bower_components/harmony-reflect/      |     21.76 |      8.87 |     30.53 |      22.3 |
      reflect.js                              |     21.76 |      8.87 |     30.53 |      22.3 |
   lib/es6/                                   |       100 |       100 |       100 |       100 |
      Proxy.js                                |       100 |       100 |       100 |       100 |
   lib/math/                                  |      69.7 |       100 |        25 |     68.75 |
      Vector.js                               |      69.7 |       100 |        25 |     68.75 |
   lib/models/                                |     73.08 |      42.5 |     80.65 |     72.66 |
      Controller.js                           |        72 |      42.5 |     78.57 |     71.77 |
      _BaseModel.js                           |       100 |       100 |       100 |       100 |
   lib/models/CPS/                            |      73.7 |      48.8 |     81.63 |     73.05 |
      ReferenceDict.js                        |     85.71 |     33.33 |       100 |     85.19 |
      Registry.js                             |     71.43 |      37.5 |     85.71 |     70.37 |
      StyleDict.js                            |     86.67 |     68.75 |       100 |     86.36 |
      cpsGetters.js                           |     73.33 |      37.5 |       100 |     71.43 |
      selectorEngine.js                       |     72.18 |     54.93 |        75 |     71.76 |
      whitelistProxies.js                     |      57.5 |     18.75 |        60 |     56.41 |
   lib/models/CPS/dataTypes/                  |     78.67 |      8.33 |     69.23 |     77.14 |
      CPSDictionaryEntry.js                   |     92.31 |       100 |        80 |     91.67 |
      CPSReal.js                              |      62.5 |         0 |        40 |        60 |
      CPSVector.js                            |        75 |         0 |        80 |     73.33 |
      SharedFormulaeFactory.js                |     82.35 |        50 |     83.33 |     81.25 |
      _FormulaeValue.js                       |     84.62 |       100 |        60 |     83.33 |
   lib/models/CPS/dataTypes/formulae/         |     29.85 |        50 |      18.6 |     28.79 |
      formulaEngine.js                        |     29.85 |        50 |      18.6 |     28.79 |
   lib/models/CPS/dataTypes/formulae/parsing/ |     83.22 |     66.87 |     84.81 |     82.68 |
      BracketToken.js                         |       100 |       100 |       100 |       100 |
      NameToken.js                            |       100 |       100 |       100 |       100 |
      NumberToken.js                          |       100 |       100 |       100 |       100 |
      OperatorToken.js                        |     86.52 |     75.56 |     92.86 |     86.36 |
      Parser.js                               |     82.56 |     65.63 |     95.45 |      82.2 |
      SelectorToken.js                        |        70 |       100 |        50 |     66.67 |
      Stack.js                                |     72.73 |        50 |      62.5 |     72.09 |
      StringToken.js                          |     77.78 |       100 |        50 |        75 |
      _Token.js                               |        80 |      62.5 |     81.82 |     79.41 |
      _ValueToken.js                          |     88.89 |       100 |        75 |      87.5 |
   lib/models/CPS/elements/                   |     71.21 |     39.44 |     66.03 |     70.23 |
      AtNamespaceCollection.js                |     61.54 |         0 |     66.67 |     58.33 |
      AtRuleCollection.js                     |     76.19 |     33.33 |     83.33 |        75 |
      AtRuleName.js                           |       100 |       100 |       100 |       100 |
      Combinator.js                           |     76.47 |        25 |     66.67 |        75 |
      Comment.js                              |     66.67 |       100 |        40 |     63.64 |
      ComplexSelector.js                      |      66.2 |     60.71 |     58.33 |     65.71 |
      CompoundSelector.js                     |     73.58 |        45 |        70 |     73.08 |
      GenericCPSNode.js                       |       100 |       100 |       100 |       100 |
      Parameter.js                            |     89.47 |       100 |        75 |     88.89 |
      ParameterCollection.js                  |     66.67 |     38.89 |     56.25 |     66.15 |
      ParameterDict.js                        |      55.1 |        40 |        50 |     54.17 |
      ParameterName.js                        |       100 |       100 |       100 |       100 |
      ParameterValue.js                       |     67.35 |      37.5 |     61.54 |     66.67 |
      Rule.js                                 |     85.19 |       100 |        75 |     84.62 |
      SelectorList.js                         |     61.22 |        40 |     42.86 |     60.42 |
      SimpleSelector.js                       |     62.07 |     23.08 |     72.73 |      61.4 |
      _Collection.js                          |     90.48 |        50 |        75 |        90 |
      _Name.js                                |     92.31 |         0 |        80 |     91.67 |
      _Node.js                                |     93.75 |       100 |     83.33 |     93.33 |
   lib/models/CPS/parsing/                    |     74.34 |     51.22 |     84.62 |     73.41 |
      Source.js                               |        90 |       100 |        80 |     88.89 |
      atDictionaryFactories.js                |     89.74 |     86.67 |       100 |     89.19 |
      baseFactories.js                        |     91.67 |       100 |        80 |     90.91 |
      curry.js                                |       100 |       100 |       100 |       100 |
      engine.js                               |     90.91 |     67.65 |       100 |     90.74 |
      parameterFactories.js                   |     48.15 |     22.95 |     64.29 |     46.84 |
      parseRules.js                           |     90.91 |       100 |       100 |        90 |
      parseSelectorList.js                    |        75 |     57.14 |       100 |     74.07 |
      selectorFactories.js                    |        73 |     48.39 |     83.33 |     72.45 |
   lib/models/MOM/                            |     89.53 |        75 |     79.45 |     89.26 |
      Glyph.js                                |     76.47 |       100 |        60 |        75 |
      Master.js                               |       100 |        50 |       100 |       100 |
      Multivers.js                            |     88.24 |       100 |     66.67 |      87.5 |
      PenStroke.js                            |       100 |       100 |       100 |       100 |
      PenStrokePoint.js                       |     87.88 |        50 |     66.67 |     89.66 |
      PenStrokePointCenter.js                 |       100 |       100 |       100 |       100 |
      PenStrokePointLeft.js                   |       100 |       100 |       100 |       100 |
      PenStrokePointRight.js                  |       100 |       100 |       100 |       100 |
      Univers.js                              |       100 |       100 |       100 |       100 |
      _Contour.js                             |     88.89 |        50 |       100 |      87.5 |
      _Node.js                                |     86.21 |        80 |     71.43 |     85.96 |
      _PenStrokePointChild.js                 |       100 |       100 |       100 |       100 |
   lib/npm_converted/gonzales/lib/            |     49.63 |      34.4 |     45.42 |      54.8 |
      cssp.translator.node.js                 |     34.09 |      6.67 |     19.23 |        35 |
      gonzales.cssp.node.js                   |     50.16 |     36.41 |      48.8 |     55.62 |
      gonzales.js                             |        50 |         0 |        40 |        50 |
   lib/npm_converted/immutable-complex/lib/   |     16.85 |      5.13 |      9.09 |     16.25 |
      Complex.js                              |     16.85 |      5.13 |      9.09 |     16.25 |
   lib/project/parameters/                    |       100 |       100 |       100 |       100 |
      registry.js                             |       100 |       100 |       100 |       100 |
   lib/ufoJS/lib/                             |     38.86 |     18.38 |     27.59 |     40.48 |
      errors.js                               |     78.95 |     26.32 |     66.67 |     78.95 |
      main.js                                 |     27.74 |     17.09 |     17.39 |     29.23 |
   lib/ufoJS/lib/tools/misc/                  |     21.92 |      2.27 |     10.34 |     21.92 |
      transform.js                            |     21.92 |      2.27 |     10.34 |     21.92 |
----------------------------------------------|-----------|-----------|-----------|-----------|
All files                                     |     56.83 |     32.94 |     55.54 |     58.21 |
----------------------------------------------|-----------|-----------|-----------|-----------|

$ mkdir metapolator_tests
$ cd metapolator_tests
$ metapolator
Usage: metapolator [options] [command]

Commands:

   delete <[project/]master>                             Delete the given master
   dev-playground-cps <cps-file>                         Process the given CPS file
   dev-playground-cps-algebra <equation>                 Insert a linear equation
   dev-playground-cps-selectors <master> <selectors>     Run a comma-separated list of selectors on the given master
   export <[project/]master> <ufo>                       Export a master to a UFO
   import <ufo> <[project]/master>                       Import a UFO to a master
   init <name>                                           Initialise a new project called <name>
   interpolate <masters> <proportions> <new-master>      Interpolate a comma-separated list of masters according to a corresponding list of proportions
   red-pill [ufo]                                        Open a UFO (default: current directory) in the red-pill web interface
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
0
$ metapolator red-pill ./test.ufo
Metapolator: Serving the red pill.
Open http://localhost:3000 in your browser.
```

NOTE: the GUI won't yet let you save changes, but it is a good way to experiment with CPS. There is a short [screencast](https://plus.google.com/101961686124685905596/posts/QghMpxt5NpL) of an early version.

Have a look at data/com.metapolator/project.yaml: you can set up new masters in that file by copying the data of first_master.

## In the browser

```
# this is only preparation for the browser interface using angularJS
# you won't see a lot here

# start the server:
$ ./serve.sh

# go to: http://localhost:8000
# you'll see a simple scene where you can add 'widgets' to a 'container'

```

Running the tests in the browser will be supported, too.

# Preparing fonts for import

The outlines should be preparead as _strokes_:

* even number of points per contour otherwise we skip it
* more than 3 points per contour otherwise we skip it
* the first point should be the first right outline point of your stroke contour otherwise the skeleton gets scrambled

TODO: create a first steps tutorial

# Development tools

Partial support for code navigation with [TernJS](http://ternjs.net) is available. See `make-tern-project` in the top-level directory to create a suitable `.tern-project` file.

For debugging the command-line interface or server code, [node-inspector](https://github.com/node-inspector/node-inspector) is good.

We need more tests! Any contributions gratefully received.