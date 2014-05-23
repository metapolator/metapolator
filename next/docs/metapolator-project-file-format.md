".mp" Metapolator Project and Meta Master (.ufo with some spice) File Format
============================================================================

Metapolator Neue, is a parametric font tool that helps with the creation
of font-super-families. Despite having a format to store a complete
Family/Project it also has a format to store one Meta-Master (in some cases
a font in this format is called "instance"). The ".mp" format is like a
super-family container for Meta Master UFOv3 files.

This file is a work in progress. It will become the documentation of the
".mp" Metapolator Project file format.


Metapolator pursues the course of UFO and defines the Metapolator Project
as a file format based on a directory structure:

```
my-super-family.mf                   the Metapolator Project directory
├── project.plist                    stitching together all the pieces
│                                    we use .plist because its used already in
│                                    UFO a lot
├── global.cps                       a Cascading Parameters Sheet that
│                                    each Master uses
└── masters                          directory with all Meta Masters
    ├── my-first-master.ufo          These UFOv3 files are documented at
    │   │                            http://unifiedfontobject.org/versions/ufo3/index.html
    │   │                            I concentrate on the metapolator
    │   │                            special aditions
    │   ├── ... (UFOv3 stuff)
    │   ├── data
    │   │   └── com.metapolator.cps  a Cascading Parameters Sheet local
    │   │                            to the master
    │   └── glyphs.skeleton          a UFOv3 layer directory where we store
    │       │                        the skeleton as open contours.
    │       └── ...
    ├── my-second-master.ufo
    │   └── ...
    └── ...




```
