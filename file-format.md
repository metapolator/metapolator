# Metapolator Project Files

This is the documentation of the `.mp` Metapolator Project file format.

_This document is a work in progress._

With Metapolator you can create super-families, and this requires both a file format for complete family projects and also a format to store the individual CPS-based fonts that we call Meta-Masters.
The `.mp` format is a container for font families based on the UFOv3 format that is documented at <http://unifiedfontobject.org/versions/ufo3>.

Like any UFO, it is a 'file format' that is actually a directory structure, and it is a valid single UFOv3 with layers for each Meta-Master.
This is nice because no UFO data is duplicated (but this may prove restrictive in practice as information that could belong in various `fontinfo.plist` files has to be stored in a `lib.plist` or `data/com.metapolator.yaml` file.)

The following directory diagram shows the additions to UFOv3 that are specific to Metapolator:

```
my-first-master.ufo          UFOv3 directory
├── data
|   ├── com.metapolator.globals.cps      Cascading Properties Sheet file, 
|   |                                    with data global to all layers
|   |
|   ├── com.metapolator.skeleton001.cps  Cascading Properties Sheet file, 
|   |                                    with data local to the layer.
|   |
|   ├── com.metapolator.skeleton002.cps  Cascading Properties Sheet file, 
|   |                                    with data local to the layer.
|   |
│   └── com.metapolator.skeleton003.cps  Cascading Properties Sheet file, 
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