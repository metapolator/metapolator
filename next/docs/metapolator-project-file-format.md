".mp" Metapolator Project and Meta Master (.ufo with some spice) File Format
============================================================================

Metapolator Neue, is a parametric font tool that helps with the creation
of font-super-families. Despite having a format to store a complete
Family/Project it also has a format to store one Meta-Master (in some cases
a font in this format is called "instance"). The ".mp" format is like a
super-family container for Meta Master UFOv3 files.

This file is a work in progress. It will become the documentation of the
".mp" Metapolator Project file format.

Metapolator builds on UFO, and defines the Metapolator Project
as a similar 'file format' that is actually a directory structure.

## Initial Proposal

Lasse's original proposal with tweaks from Dave:

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

## Single UFOv3

Dave's alternative 'single UFOv3 with layers' approach. This is nice because it is normalised, with no redundant UFO stuff, but that may prove restrictive in practice as information that could belong in `fontinfo.plist` has to be stored in a `lib.plist` or `data/com.metapolator.yaml` file

```
my-first-master.ufo          UFOv3 directory. This format is documented at
│                            http://unifiedfontobject.org/versions/ufo3/
│                            And the following describes the additions
│                            specific to metapolator.
├── data
|   ├── com.metapolator.globals.cps      Cascading Parameters Sheet file, 
|   |                                    with data global to all layers
|   |
|   ├── com.metapolator.skeleton001.cps  Cascading Parameters Sheet file, 
|   |                                    with data local to the layer.
|   |
|   ├── com.metapolator.skeleton002.cps  Cascading Parameters Sheet file, 
|   |                                    with data local to the layer.
|   |
│   └── com.metapolator.skeleton003.cps  Cascading Parameters Sheet file, 
│                                        with data local to the layer.
│
├── glyphs                   UFOv3 layer directory, where we store
|   │                        the original imported closed contours
|   └── ... (UFOv3 GLYF files)
|
├── glyphs.skeleton001       a UFOv3 layer directory where we store
|   │                        a skeleton as open contours, created 
|   |                        by inference of the glyphs layer during import 
|   └── ... (UFOv3 GLYF files)
|
├── glyphs.skeleton002       a UFOv3 layer directory where we store
|   │                        a skeleton as open contours, created
|   |                        by the user cloning the first skeleton
|   |                        and adjusting its positions 
|   └── ... (UFOv3 GLYF files)
|
├── glyphs.skeleton003       a UFOv3 layer directory where we store
|   │                        a skeleton as open contours, created
|   |                        by the user cloning the first skeleton
|   |                        and adjusting its positions 
|   └── ... (UFOv3 GLYF files)
|
└── ... (UFOv3 stuff)
```

## Many UFOs

Dave's alternative UFOv2 or UFOv3 many-UFOs approach. The benefit of this is that is is 'Load/Save' not 'Import/Export', as all the font data is always in a format that many existing UFO-native tools can edit. With this, Metapolator easily fits into existing worlflows.

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
└── masters                          directory containing all Masters and Meta Masters.
    │ 
    ├── my-original-master.ufo       UFOv2/3 directory. This format is documented at
    │   │                            http://unifiedfontobject.org
    │   │                            The following describes the additions
    │   │                            specific to metapolator.
    │   │
    │   ├── ... (Imported UFO files) Ignored.
    │   │
    │   └── glyphs                   UFO layer directory, where we store
    │       │                        the original imported closed contours.
    │       └── ...                  
    |   
    | 
    ├── my-original-master-meta.ufo  UFO directory.
    │   │
    │   ├── metainfo.plist           The only required file in a UFO. 
    |   |                            We use a standard, static, file for this.
    │   │
    │   ├── fontinfo.plist           Only master-specific information is needed.
    │   │
    │   ├── ... (Other UFO files)    Ignored.
    │   │
    │   ├── data
    |   |   └── com.metapolator.cps  Cascading Parameters Sheet file, 
    |   |                            with data local to the metamaster's glyphs.
    │   │
    │   └── glyphs                   UFO layer directory, where we store
    │       │                        a skeleton as open contours, created
    │       └── ...                  by inferring a skeleton from the imported
    |                                UFO with closed contours
    |
    ├── my-new-meta-master.ufo       UFO directory.
    │   │
    │   ├── metainfo.plist           The only required file in a UFO.
    |   |                            We use a standard, static, file for this.
    │   │
    │   ├── fontinfo.plist           Only master-specific information is needed.
    │   │
    |   ├── ... (Other UFO files)    Ignored.
    │   │
    │   ├── data
    |   |   └── com.metapolator.cps  Cascading Parameters Sheet file, 
    |   |                            with data local to the metamaster's glyphs.
    │   │
    │   └── glyphs                   UFO layer directory, where we store
    │       └── ...                  a skeleton as open contours, created
    |                                by the user cloning the first skeleton
    |                                and adjusting its positions, or drawing it
    |
    ├── another-meta-master.ufo          
    │   └── ...
    └── ...

```

## Non-UFO

Lasse's counter proposal to the above, aiming for normalization, where there is no _working_ UFO data (implying that Metapolator loads/saves this format and imports/exports working UFOs):

```
my-super-family.mf                   directory containing a Metapolator Project. 
│
├── project.yml                      yaml file to stitch together all the pieces
│                                    (We use yaml because its easy to author,
│                                    UFO uses plist in a similar way, but plist 
|                                    is a legacy format)
|
├── base.ufo                         generic UFO data for instance generation
|                                    that does NOT have a glyphs subdirectory
|
├── instance001.cps                  Instance definition 
|
├── parameters
|   ├── global.cps
│   ├── skeleton001.cps
│   ├── some-ideas.cps
│   └── skeleton002.cps
└── skeletons
    ├── skeleton001                  directory containing UFOv3 GLYF files of
    |   │                            'skeleton' open contours, created 
    |   |                            by inference of the glyphs layer during import 
    |   └── ...
    └── skeleton002                  directory containing UFOv3 GLYF files of
        └── ...                      'skeleton' open contours, created 
                                     by cloning the first and adjusting its point positions
```
