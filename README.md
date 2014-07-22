# Metapolator

Metapolator is a web-based parametric font editor.

It provides a GUI for designing with UFO fonts and Metafont – a language for semi-algorithmic specification of typefaces. Metapolator was created out of the need to create large font families efficiently.

For classical interpolation using multiple masters and axes, Metapolator can load normal UFO fonts (without any modifications) load and save into the UFO format and create new instances on the fly.

To use the full potential of parametrising fonts, Metapolator can parse already existing fonts (such as PostScript Type 1 or OpenType). They need to be broken up into separate shapes resembling strokes and provide consistent counterpoints. In this process, a Metafont is produced by specifying the central skeleton of shapes – for which there are "pens" of different angles and widths along the skeleton. As the glyph shapes are defined through equations, they can be parametrised along axes such as aspect ratio, weight, slant, stroke width, contrast and so on.

Furthermore instead of using prepared fonts it will be possible to enhance normal UFO fonts by adding parameters on request and only parametrise certain parts of a glyph.

Metapolator allows the designer to utilise Metafont without have to write any Metafont code.

* * * 

We are actively documenting our project on our wiki, <https://github.com/metapolator/metapolator/wiki/>:

* [Interaction Design](https://github.com/metapolator/metapolator/wiki/Interaction-Design)
* Software Development
  * [Concepts](https://github.com/metapolator/metapolator/wiki/roadmap)
  * [Roadmap](https://github.com/metapolator/metapolator/wiki/roadmap)

Our community is built around [Google+](https://plus.google.com/communities/110027004108709154749)

#### License

This project is licensed under the [GNU General Public License v3.0](http://www.gnu.org/copyleft/gpl.html) and your contributions are welcome via Github at <https://github.com/metapolator/metapolator>

#### Thanks

Core Development Team: Simon Egli (CH), Lasse Fister (DE), Alex Troush (UA), Reuben Thomas (UK), Dr Ben Martin (AU)

Contributors: Walter Egli (CH), Vitaly Volkov (UA), Nicolas Pauly (FR), Wei Huang (AU), you (anywhere)?

Thanks to [metaflop](http://www.metaflop.com) for inspiration and Simon Egli for initiating this project!
