#!/bin/bash
#
#
# This script will move you to master in the local git repository and
# bring in merged changes from the metapolator project's master
# branch. Submodules will also be updated to the latest sources.
#
# Note that this should work either in a tree that is cloned from the
# main metapolator project git tree or from a fork of that tree on
# github. In both cases the metapolator project git tree is referenced
# as 'upstream' using the below setup which you can create by
# executing git-setup.sh. If you have cloned the main metapolator
# project git tree then origin and upstream should be the same
# repository but should not have any adverse effects.
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
# in the main metapolator updates. The git-setup.sh script should do this for you
# leaving you with a section like the following in your .git/config file:
# 
# [remote "upstream"]
#        url = git://github.com/metapolator/metapolator.git
#        fetch = +refs/heads/*:refs/remotes/upstream/*
#        fetch = +refs/pull/*/head:refs/remotes/upstream/pr/*
#
# git metapolator-update
#
git checkout master
git fetch upstream
git submodule foreach git pull origin master
git merge upstream/master


# git config alias.update-submodules "submodule foreach git pull origin master"
# git config alias.metapolator-update  '!sh -c "git checkout master && git fetch upstream && git update-submodules && git merge upstream/master"'

