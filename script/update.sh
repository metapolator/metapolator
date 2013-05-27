#!/bin/sh
#
# Carlos used this script in development mode, just to easily update
# the 3rd party code (bs and font awesome).
#

set -e

export UP_HOME=~/code/ruby/up
export BS_HOME=~/code/js/bootstrap
export FA_HOME=~/code/js/Font-Awesome

echo "updating bootstrap 3..."
cd $BS_HOME
git checkout 3.0.0-wip
git pull origin 3.0.0-wip
cp -rf less/* $UP_HOME/_assets/bootstrap/
cp -f js/bootstrap-{transition,collapse}.js $UP_HOME/_assets/bootstrapjs/

echo "updating font awesome..."
cd $FA_HOME
git pull origin master
cp -f build/assets/font-awesome/less/*.less $UP_HOME/_assets/fontawesome/
cp -rf build/assets/font-awesome/font/* $UP_HOME/font/

echo "building..."
cd $UP_HOME
make
