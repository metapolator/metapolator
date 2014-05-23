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
my-super-family.mf                   directory containing a Metapolator Project. 
│
├── project.yml                      yaml file to stitch together all the pieces
│                                    (We use yaml because its easy to author,
│                                    UFO uses plist in a similar way, but plist 
|                                    is a legacy format.)
│
├── global.cps                       Cascading Parameters Sheet file that
│                                    each Master uses.
│
├── instance0001.cps                 Cascading Parameters Sheet file that
│                                    defines an instance.
│
└── metamasters                      directory containing all Meta Masters.
    │ 
    ├── my-first-master.ufo          UFOv3 directory. This format is documented at
    │   │                            http://unifiedfontobject.org/versions/ufo3/
    │   │                            And the following describes the additions
    │   │                            specific to metapolator.
    │   ├── ... (UFOv3 stuff)
    │   ├── data
    |   |   ├── com.metapolator.skeleton001.cps  Cascading Parameters Sheet file, 
    |   |   |                                    with data local to the master's layer.
    |   |   |
    |   |   ├── com.metapolator.skeleton002.cps  Cascading Parameters Sheet file, 
    |   |   |                                    with data local to the master's layer.
    |   |   |
    │   │   └── com.metapolator.skeleton003.cps  Cascading Parameters Sheet file, 
    │   │                                        with data local to the master's layer.
    │   │
    │   ├── glyphs                   UFOv3 layer directory, where we store
    │   |   │                        the original imported closed contours
    │   |   └── ...                  
    |   |
    │   ├── glyphs.skeleton001       a UFOv3 layer directory where we store
    │   |   │                        a skeleton as open contours, created 
    |   |   |                        by inference of the glyphs layer during import 
    │   |   └── ...
    |   |
    │   ├── glyphs.skeleton002       a UFOv3 layer directory where we store
    │   |   │                        a skeleton as open contours, created
    |   |   |                        by the user cloning the first skeleton
    |   |   |                        and adjusting its positions 
    │   |   └── ...
    |   |
    │   ├── glyphs.skeleton003       a UFOv3 layer directory where we store
    │   |   │                        a skeleton as open contours, created
    |   |   |                        by the user cloning the first skeleton
    |   |   |                        and adjusting its positions 
    │       └── ...
    | 
    ├── my-second-master.ufo
    │   └── ...
    └── ...




```
