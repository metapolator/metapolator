Metapolator Neue
=================

See the docs directory for developer documentation.

This is currently only used to explore the concepts we are going to build
the next Metapolator on.

You can't see a lot yet, but here is what you can do:

```
# clone the repository
$ git clone git@github.com:metapolator/metapolator.git
$ cd metapolator

# checkout the 'next' branch: 
$ git checkout next

# start the server:
cd next
$ ./serve.sh

# go to: http://localhost:8000
# you'll see a simple scene where you can add 'widgets' to a 'container'

```

If you wan't run the testsuite:

```
# after checking out the 'next' branch and `cd next`:
# should install `The Intern`, because the Intern does the testing
$ npm install

# run the testsuite, there is only one test right now:
$ ./runtest
Defaulting to "console" reporter
PASS: main - Metapolator - Metapolator_Constructor (1ms)
1/1 tests passed
1/1 tests passed

---------------------+-----------+-----------+-----------+-----------+
File                 |   % Stmts |% Branches |   % Funcs |   % Lines |
---------------------+-----------+-----------+-----------+-----------+
   lib/              |       100 |       100 |       100 |       100 |
      Metapolator.js |       100 |       100 |       100 |       100 |
---------------------+-----------+-----------+-----------+-----------+
All files            |       100 |       100 |       100 |       100 |
---------------------+-----------+-----------+-----------+-----------+

# running the tests in the browser will be supported, too, soon

```
