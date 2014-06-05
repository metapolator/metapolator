## Terminology

Superness? Overshoot? Instance? We're describing the terminology below to shed some light onto some frequently used terms.

### Metapolator

A wordplay referring to Erik van Blokland's [Superpolator](http://superpolator.com/) and Pablo Impallari's [Simplepolator](http://www.impallari.com/projects/overview/simplepolator) interpolation font tools, and the font programming language [Metafont](http://en.wikipedia.org/wiki/Metafont)

### UFO

[Unified Font Object](http://unifiedfontobject.org/) font format for font-application interchange, used for loading and saving fonts in Metapolator.

### Master

A Master can be compared and interpolated with another Master along an axis.

### Axis

Distance between two masters, for example between `A` and `B`: `A ----- B`

### Instance

A new font created at a certain position on an axis, or between multiple axes.

### Point

![
](https://raw.github.com/metapolator/metapolator/gh-pages/images/curve.png)

Depending on the nature of a [point](http://unifiedfontobject.org/versions/ufo1/glif.html), we can have a control-in and / or a control-out point. The direction of a path defines wheter its an 'in' or 'out' point. In this example we have a curve point (orange) with a control-in (red) and control-out (green) point. The arrow indicates the curve direction.
In the UFO its writen like this:

```
<point x="340" y="65"/>
<point x="340" y="184" type="curve"/>
<point x="340" y="295"/>
```

### Parameters

A parameter is a characteristic, feature, or measurable factor that can help in defining a particular system. We use parameters on various levels to define fonts: `Global parameters` are on a font level, for example `font size`. `Glyph parameters` are on a glyph level, for example `glyph width`. `Point parameters` are on a point and curve level of a glyph shape, for example the position or `coordinate` of a point.

### Z-Point
Point in a two dimensional cartesian coordinate system, defined by x and y coordinates:
`z=(x,y)`