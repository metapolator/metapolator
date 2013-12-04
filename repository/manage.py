#!/usr/bin/env python
import os
import sys

from migrate.versioning.shell import main

pythonpath = os.path.realpath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.append(pythonpath)

from metapolator.config import DATABASE_ENGINE

if __name__ == '__main__':
    main(url=DATABASE_ENGINE, debug='False', repository='repository')
