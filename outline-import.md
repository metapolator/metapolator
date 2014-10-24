# Outline Import

How to import outlines from regular contours into metapolator:
a Model of Skeleton and Parameters.

An outline consists of several elements, which we have to deal with, in
hierarchical order that is:
    
1. Outline
2. Contours
3. Commands
4. Points/Coordinates
5. Real Numbers

The one thing left out of this hierarchy is Components, because these are
handled as glyphs themselves. At least for the moment, maybe we'll find
out that including the components into our glyph will yield in better results.
Or we may end up with a separate, component-like glyph-part, to provide 
a more sophisticated pattern for reuse. 

We look at this problem from the point of a contour. Because this is the
actual element that defined a single path. The process that works for a
single contour can then be repeated for all of the contours.

A contour or subpath is made from different commands, often referred to as
**segments**, although the UFO format kind of  hides that fact by putting
the commands inside of point attributes and leaving us a plain list of points.
The commands of a contour are the well known commands used by postscript itself:

* closepath
* move PostScript: moveto
* lineto
* qcurveto (is this in PS?)
* curveto

## PostScript to UFO and back again

PostScript, UFO, Metapost and thus Metapolator are all interwoven. Because
at the end of the day for us everything boils down to the creation of
PostScript-Outlines. So when thinking about outline data, we should have
a little understanding on how these different applications and formats
connect to each other.

### closepath

In PostScript, to end a contour by closing it the command closepath is used.
However to leave a contour open, a moveto will do so if applied after
drawing some  curves and lines. UFO doesn't have this, because a closed
`</contour>` does this part. 


### move/moveto

In PostScript moveto moves the virtual pen to a new position, it therefore
takes only one Point as argument. The Purpose of moveto in PostScript is
to create a new contour by defining its first point. Each PostScript 
contour must start with a moveto.

UFO uses the move command only to define a not-closed contour/open path. 
A move-point in UFO must therefore always be the first point in a contour
that should be open.  It's not allowed to have a move point after some 
other points in a contour.
    
### lineto

In PostScript and UFO all commands of a path end with an "on curve point".
lineto in PS connects that last on curve point with the next on curve point
by using a straight line, it consumes one Point to do so.

### qcurveto

UFO allows to specify outlines using truetype quadratic curves. A quadratic
uses one off-curve or control point and one final on curve point, to define
a smooth curve from the previous point to this one.

PostScript uses instead cubic curves. Cubic curves are mightier than qadratic 
curves. We can convert quadratic curves into cubic curves without loss of 
information regarding the form of the resulting outline.

### curveto

Curveto in PostScript or curve in UFO defines a cubic curve. A cubic
curve defines a curve from the previous on curve point to a new on curve 
point one, using two off-curve control points. It thus needs 3 points to 
be defined and of course one previous existing point.
 
## FromUFO to Metapolator and MetaPost

In Metapolator we aren't going to describe our curves using CurveTo commands.
Instead we are going to use a curve type defined by John Hobby, "Hobby splines".
These curves can be calculated from cubic curves and even more important,
we can convert them back to cubics. Hobby splines don't use the two control points
of cubics to define the curve; instead, they use two angles and two "tension" parameters, which
allows us to define curves in a more semantic way. An even more striking
point is that via the tension parameter a "most pleasing curve" can be defined, which gives us a very smooth transition between points.
(is this correct)?

What we want to extract from our UFOs is the data of a "stroke", defined 
by Hobby splines.

### The Stroke

is a concept best explained by talking about a pen. A pen moves along a
path, leaving a trace of itself, the stroke. The stroke has a thickness,
thus where the path of the pen is just a line (one dimension) in the center 
of the pen, the stroke is a plane (two dimension).

In our model for the import, the pen itself is only one dimensional, too.
It is a line that defines the outline while moving it a along the path.
For each on curve point of the path the pen leaves two outlines points,
one on the right side and one on the left side. The size, that is the 
length, of the line defining the pen can vary between on curve points. So
we can describe typographical contrast between thick and thin lines.

## Data extraction:

In order for us to extract stroke data from a contour, it must fulfill two
fundamental properties:

* the path must be closed
* the on-curve points of the path must count to an even number (because
  the pen always leaves two outline points per one center point).

And to be useful for us, we need some more, not mandatory, properties:

* the outline should describe a stroke not a blob 
* we will take the first point of the outline as the first-right point,
  and the last point of the outline as the first-left-point. Thus the
  point at floor(count(outline-points)/2) will be the last-right point
  and the point at ceil(count(outline-points)/2) will be the last-left
  point.


