Metapolator
==============

## Introduction

Metapolator is a web-based parametric font editor.

It provides a GUI for designing with UFO fonts and Metafont – a language for semi-algorithmic specification of typefaces. Metapolator was created out of the need to create large font families efficiently.

For classical interpolation using multiple masters and axes, Metapolator can load normal UFO fonts (without any modifications) load and save into the UFO format and create new instances on the fly.

To use the full potential of parametrising fonts, Metapolator can parse already existing fonts (such as PostScript Type 1 or OpenType). They need to be broken up into separate shapes resembling strokes and provide consistent counterpoints. In this process, a Metafont is produced by specifying the central skeleton of shapes – for which there are "pens" of different angles and widths along the skeleton. As the glyph shapes are defined through equations, they can be parametrised along axes such as aspect ratio, weight, slant, stroke width, contrast and so on.

Furthermore instead of using prepared fonts it will be possible to enhance normal UFO fonts by adding parameters on request and only parametrise certain parts of a glyph.

Metapolator allows the designer to utilise Metafont without have to write any Metafont code.

## Wiki

We are actively documenting our project on our wiki:
* **<https://github.com/metapolator/metapolator/wiki/>**
  * [Product Vision](https://github.com/metapolator/metapolator/wiki/Product-Vision)
  * [Roadmap](https://github.com/metapolator/metapolator/wiki/roadmap)

### License

This project is licensed under the [GNU General Public License v3.0](http://www.gnu.org/copyleft/gpl.html) and your contributions are welcome via Github at <https://github.com/metapolator/metapolator>

## Thanks

Core Development Team: Simon Egli (CH), Lasse Fister (DE), Alex Troush (UA), Reuben Thomas (UK), Dr Ben Martin (AU)

Contributors: Walter Egli (CH), Vitaly Volkov (UA), Nicolas Pauly (FR), Wei Huang (AU), you (anywhere)?

Thanks to [metaflop](http://www.metaflop.com) for inspiration and Dave Crossland for initiating this project!

## Related Projects

### For Users

* http://metaflop.com libre parametric font editor web app
* http://prototypo.io libre parametric font editor web app
* http://glyphrstudio.com outline font editor web app
* http://fontark.net outline font editor web app, proprietary
* http://fontforge.github.io outline font editor desktop app
* http://mondrian.io outline illustration web app
* https://code.google.com/p/svg-edit/ outline illustration web app
* http://popcornjs.org video editor web app
* http://plucked.de audio editor web app

### For Developers

* http://en.wikipedia.org/wiki/MetaFont parametric font system
* http://en.wikipedia.org/wiki/MetaPost parametric drawing system
* http://fontforge.org/python.html font editor Python module
* http://github.com/behdad/fonttools Python library and command line tool for font binaries: reading, writing, subsetting with OpenType feature support 
* http://nodebox.github.io/opentype.js JS library for reading font binaries
* https://github.com/ynakajima/ttf.js JS library for reading font binaries
* https://github.com/bramstein/opentype JS library for reading font binaries
* https://github.com/Pomax/A-binary-parser-generator/ JS library for reading arbitrary binaries given a spec file
* https://github.com/graphicore/ufoJS JS library for reading font sources and rendering them on canvas
* http://paperjs.org JS library for canvas drawing from Switzerland
* http://jonobr1.github.io/two.js JS library for canvas drawing from Google
* http://www.createjs.com/#!/EaselJS JS library for canvas drawing from Adobe
* http://snapsvg.io/ useful SVG library from Adobe
