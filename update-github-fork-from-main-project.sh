#!/bin/bash
#
#
# This script will move you to master and bring in merged changes 
# from the metapolator project's master branch. Submodules will also
# be updated to the latest sources.
#
# This script is intended to be run before you start work on a new feature
# using something like the following workflow:
#
# ./update-github-fork-from-main-project.sh
# git branch   yyyymm/wonderful-new-feature
# git checkout yyyymm/wonderful-new-feature
# ... do magic
# git commit -a ...
# git push origin yyyymm/wonderful-new-feature
# goto github website and create a PR
#
# You will need to have an 'upstream' in your .git/config file to bring
# in the main metapolator updates.
# 
# [remote "upstream"]
#        url = git://github.com/metapolator/metapolator.git
#        fetch = +refs/heads/*:refs/remotes/upstream/*
#        fetch = +refs/pull/*/head:refs/remotes/upstream/pr/*
#

git checkout master
git fetch upstream
git submodule foreach git pull origin master
git merge upstream/master


