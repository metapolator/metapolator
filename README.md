# Metapolator [![Build Status](https://travis-ci.org/metapolator/metapolator.png?branch=master)](https://travis-ci.org/metapolator/metapolator)

Metapolator will be a web-based parametric font editor, providing a GUI for designing with UFO fonts and Metafont technologies.
Metapolator is intended for type designers to design large font families faster, and for typographically sensitive graphic designers to adjust their libre fonts for their exact needs.
For example, expanding a single style design into a family of weights and widths, or fine-tuning the weight and width of a font for your exact needs.

Metapolator first provides a typical 'super' interpolation system that works with unlimited numbers of masters and axes, and will load and save normal UFO fonts. 

It will go further, into 'metapolation': leveraging parameterization to create new masters.
This will work best when glyphs are drawn as separate, overlapping shapes with pairs of points along each edge.
This style of digital drawing is commonly practiced, as it helps when drawing shapes resembling strokes of pens. 

The original drawn outline can be reconstructed from an inferred central skeleton (ductus) and Hobby splines (from Metafont.)
This reconstruction process is flexible, working similarly to the 'nudge' tools of other font editors.

Metapolator will allow designers to use Metafont technology without have to write any Metafont code.
But if you'd like that, check out [metaflop.com](http://www.metaflop.com)

### Install

Metapolator is not yet released, but if you'd like to try it out and are comfortable using development tools, please see our [developer installation instructions](https://github.com/metapolator/metapolator/wiki/installation) on our wiki.

Our user community is actively involved in development through discussions [Google+](https://plus.google.com/communities/110027004108709154749)

#### License

This project is licensed under the [GNU General Public License v3.0](http://www.gnu.org/copyleft/gpl.html) and your contributions are welcome via Github at <https://github.com/metapolator/metapolator>

#### Thanks

Core Development Team: Lasse Fister (DE), Reuben Thomas (UK), Dr Ben Martin (AU)

Interaction Design: Peter Sikking (NL), Simon Egli (CH), Nicolas Pauly (FR), Wei Huang (AU), Dave Crossland (UK)

Past Contributors: Walter Egli (CH), Vitaly Volkov (UA), Alex Troush (UA)

Thanks to [metaflop](http://www.metaflop.com) for inspiration and Simon Egli for initiating this project!
