_This glossary is in alphabetic order; terms defined in the glossary are capitalized._

### Axis

A line between two Masters, each point on which specifies an Instance created by interpolation.

### Instance

A new font specified by a certain position on an Axis, or on multiple axes.

### Master

A font specified in a standard form suitable for interpolation. A Master can be compared and interpolated with another Master along an Axis.

### Metapolator

A [portmanteau](http://en.wikipedia.org/wiki/Portmanteau) wordplay referring on the one hand to Donald Knuth's font programming language [Metafont](http://en.wikipedia.org/wiki/Metafont), and on the other to Erik van Blokland's [Superpolator](http://superpolator.com/) and Pablo Impallari's [Simplepolator](http://www.impallari.com/projects/overview/simplepolator) font interpolation tools.

### Parameters

A characteristic, feature, or other measurable factor that can be used in the definition of a particular system. We use Parameters at various levels of abstraction to define fonts. _Global parameters_ are at the font level, for example _font size_. _Glyph parameters_ are at the glyph level, for example _glyph width_. _Point parameters_ are at the Point and curve level, for example the coordinate of a Point in a particular glyph.

### Point

![](https://raw.github.com/metapolator/metapolator/gh-pages/images/wiki/curve.png)

Depending on the nature of a [point](http://unifiedfontobject.org/versions/ufo1/glif.html), we can have a control-in and/or a control-out Point. The direction of a path defines wheter it's an 'in' or 'out' Point. In this example we have a curve Point (orange) with a control-in (red) and control-out (green) Point. The arrow indicates the curve direction.

This Point is represented thus in UFO:

```
<point x="340" y="65"/>
<point x="340" y="184" type="curve"/>
<point x="340" y="295"/>
```

### UFO

[Unified Font Object](http://unifiedfontobject.org/) is a font format for font application interchange, used for loading and saving fonts in Metapolator.

### Z-Point
Point in a two dimensional cartesian coordinate system, defined by x and y coordinates:
z=(x,y)