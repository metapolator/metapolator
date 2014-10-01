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

This is a 'single UFOv3 with layers' approach. This is nice because it is normalised, with no redundant UFO stuff, but that may prove restrictive in practice as information that could belong in `fontinfo.plist` has to be stored in a `lib.plist` or `data/com.metapolator.yaml` file

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