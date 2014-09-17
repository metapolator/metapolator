#!/bin/bash
#
# This script will setup a git alias 'metapolator-update' which will
# help you to maintain a checkout of Metapolator and update it when
# you wish.
#
# The configuration created will work either on a git clone of the
# main meapolator repository or on a git clone of a github fork of the
# meapolator repository.
#
# The main metapolator-update command will move you to master in the
# local git repository and bring in merged changes from the
# metapolator project's master branch. Submodules will also be updated
# to the latest sources.
#
# Note that changes are brought in from the main Metapolator
# repository, a possible extension would be allowing you to bring in
# changes from another fork of the metapolator repository for testing prior to those
# changes being merged.
#
# In the meantime, you can use the upstream setup to bring down the
# source as it is at a pull request on the main metapolator
# repository. For example, the following command will configure your
# local tree to show the sources at pull request 165. It is likely
# that other collaborators will be at a pull request stage before you
# want to try out their code anyway.
# 
# $ git checkout pr/165
#
# Note that this configuration should work either in a tree that is
# cloned from the main metapolator project git tree or from a fork of
# that tree on github. In both cases the metapolator project git tree
# is referenced as 'upstream' using the below setup which you can
# create by executing this script: git-setup.sh. If you have cloned
# the main metapolator project git tree then origin and upstream
# should be the same repository but should not have any adverse
# effects.
#
# This script is intended to be run before you start work on a new
# feature using something like the following workflow. This workflow
# assumes that you have forked Metapolator and are working on a
# checkout of your fork.
#
# git metapolator-update
# git branch   yyyymm/wonderful-new-feature
# git checkout yyyymm/wonderful-new-feature
# ... do magic
# git commit -a ...
# git push origin yyyymm/wonderful-new-feature
# goto github website and create a PR
#
#
# For reference, this is the initial command chain for
# metapolator-update alias as at Sep 2014.
#
# git checkout master
# git fetch upstream
# git submodule foreach git pull origin master
# git merge upstream/master

git remote add upstream https://github.com/metapolator/metapolator.git 
git config --add remote.upstream.fetch '+refs/pull/*/head:refs/remotes/upstream/pr/*'
git config alias.update-submodules "submodule foreach git pull origin master"
git config alias.metapolator-update  '!sh -c "git checkout master && git fetch upstream && git update-submodules && git merge upstream/master"'
git fetch upstream
