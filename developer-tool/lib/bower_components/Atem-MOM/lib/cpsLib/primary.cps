
/*#md
# About this CPS-Document

This is the most central document for the MOM, it describes how to go from
a MOM-tree to a rendered font. But, the rules defined in here, and the
expectations made, describe just an arbitrary default.
In fact, to extend the functionality of the MOM, most of the rules in here
must be overridden partially or completely by more *specific* rules from
other files.

This file connects the data produced by the importers with the data expected
by the exporters (standard renderers). If the importer is changed, it may
be that this file becomes invalid. However, this file is probably the best
starting point to learn how the MOM is transformed into fonts.

## Property Descriptions

Each CPS rule for a MOM Node in the following has a comment at the
top of it, documenting the known/used/common properties for it. This
is the reference for the concepts you will encounter there.

Properties are either set element-by-element to element.properties by the
importer, calculated directly in here via the property value definition.

### Expected Properties

Properties used by the standard renderer (renderers/basic). These properties
are the ones consumed outside of the CPS by the basic rendering process.

Custom rendering code can consume other properties, but the documentation
of these is not the scope of this document.

### Commonly Used Properties

Properties used within the CPS (in here).

### Data Types

The values returned by these properties are validated on read time to
meet their expected data type.

### *default: value* and *mandatory!*

*default* means the reader will use the default value if there is no other
value set for the key. NOTE: if these are set, they must obey the data type
expectation; there's no default to recover from a wrong data type.

*mandatory!* means the key must be present.

*/

glyph {
/*#md
## Expected Properties

 * **width**: Number, advance width of the glyph; *default: 0*
 * **height**: Number, advance width of the glyph; *default: 0*
*/
}

@namespace("glyph") {

component {
/*#md
## Expected Properties

 * **transformation**: Transformation, advance width of the glyph; *default: Identity*
 * **baseGlyphName**: String, linking to a glyph name, in the same master; *mandatory!*
*/
}

contour {
/*#md

A `<contour>` is like a commonly understood glyph contour. A flat list of
control points `<p>`.

## Expected Properties

 * **open**: Number, if not zero the contour is considered open; *default: 0*

*/
}

contour > p {
/*#md

## Expected Properties

 * **on**: Vector, absolute coordinate of the on-curve-point. *mandatory!*
 * **in**: Vector, absolute coordinate of the incoming off-curve-point. *mandatory!*
 * **out**: Vector, absolute coordinate of the outgoing off-curve-point. *mandatory!*

## Commonly Used Properties

 * **inLength**: Number, distance of incoming off-curve-point to its on-curve-point.
 * **outLength**: Number, distance of outgoing off-curve-point to its on-curve-point.
 * **inDir**: Number, angle in radians, direction from on-curve-point to incoming off-curve-point.
 * **outDir**: Number, angle in radians, direction from on-curve-point to outgoing off-curve-point.
 * **inTension**: Number, Hobby-spline tension, distance of incoming off-curve-point to its on-curve-point.
 * **outTension**: Number, Hobby-spline tension, distance of outgoing off-curve-point to its on-curve-point.
 * **pointBefore**: MOM-Node, reference to the previous sibling.
 * **pointAfter**: MOM-Node, reference to the following sibling.

*/
    in: tension2controlIn pointBefore:on pointBefore:outDir inTension inDir on;
    out: tension2controlOut on outDir outTension pointAfter:inDir pointAfter:on;
    inTension: magnitude2tensionIn pointBefore:on pointBefore:outDir inLength inDir on;
    outTension: magnitude2tensionOut on outDir outLength pointAfter:inDir pointAfter:on;
    pointBefore: parent:children[index - 1];
    pointAfter: parent:children[index+1];
}

contour > p:i(0) {
    pointBefore: parent:children[parent:children:length - 1];
}

contour > p:i(-1) {
    pointAfter: parent:children[0];
}

penstroke {
/*#md
A `<penstroke>` represents a glyph contour by defining a "centerline" via
a list of points `<center>` from each of which a `<left>` and a `<right>` point
extrudes to form a two-dimensional shape.

Each conventional contour with an even number of at least 4 on-curve points
can be converted into a penstroke. However, to make it useful for further
transformations it is important to organize the the source contour in
pair-points along the "stroke-direction".

The terminals of a `<penstroke>` require some special rules.
*/
}

}

@namespace("glyph penstroke") {

center {
/*#md
## Commonly Used Properties

 * **on**: Vector, absolute coordinate of the on-curve-point.
 * **in**: Vector, absolute coordinate of the incoming off-curve-point.
 * **out**: Vector, absolute coordinate of the outgoing off-curve-point.
 * **inLength**: Number, distance of incoming off-curve-point to its on-curve-point.
 * **outLength**: Number, distance of outgoing off-curve-point to its on-curve-point.
 * **inDir**: Number, angle in radians, direction from on-curve-point to incoming off-curve-point.
 * **outDir**: Number, angle in radians, direction from on-curve-point to outgoing off-curve-point.
 * **inTension**: Number, Hobby-spline tension, distance of incoming off-curve-point to its on-curve-point.
 * **outTension**: Number, Hobby-spline tension, distance of outgoing off-curve-point to its on-curve-point.
 * **pointBefore**: MOM-Node, reference to the previous sibling.
 * **pointAfter**: MOM-Node, reference to the following sibling.

*/
/* inDir and outDir are defined by the importer if this calculations would
not yield good results. */
    inDir: (on - in):angle;
    outDir: (out - on):angle;
    pointBefore: parent:children[index - 1];
    pointAfter: parent:children[index + 1];
}

left, right {
/*#md
## Expected Properties

 * **on**: Vector, absolute coordinate of the on-curve-point. *mandatory!*
 * **in**: Vector, absolute coordinate of the incoming off-curve-point. *mandatory!*
 * **out**: Vector, absolute coordinate of the outgoing off-curve-point. *mandatory!*

## Commonly Used Properties

 * **inLength**: Number, distance of incoming off-curve-point to its on-curve-point.
 * **outLength**: Number, distance of outgoing off-curve-point to its on-curve-point.
 * **inDir**: Number, angle in radians, direction from on-curve-point to incoming off-curve-point.
 * **outDir**: Number, angle in radians, direction from on-curve-point to outgoing off-curve-point.
 * **inDirIntrinsic**, Number, angle in radians, offset from the parent `<center>` point inDir property.
 * **outDirIntrinsic**, Number, angle in radians, offset from the parent `<center>` point outDir property.
 * **onLength**, Number, distance of `<center>` on-curve-point to `<left/right>` on-curve-point.
 * **onDir**, Number, angle in radians, direction from `<center>` on-curve-point to `<left/right>` on-curve-point.
 * **inTension**: Number, Hobby-spline tension, distance of incoming off-curve-point to its on-curve-point.
 * **outTension**: Number, Hobby-spline tension, distance of outgoing off-curve-point to its on-curve-point.
 * **pointBefore**: MOM-Node, reference to the parent-`<center>`-points previous sibling `<left/right>` child.
 * **pointAfter**: MOM-Node, reference to the parent-`<center>`-points following sibling `<left/right>` child.
*/
    pointBefore: parent:pointBefore[this:type];
    pointAfter: parent:pointAfter[this:type];
    /* TODO: Maybe, as in contour>p we should calculate the tension values here from
inLength and outLength. Then the importer would have less to take care off and
the overal setup would become more unified. */
    on: Polar onLength onDir + parent:on;
    in: tension2controlIn pointBefore:on pointBefore:outDir inTension inDir on;
    out: tension2controlOut on outDir outTension pointAfter:inDir pointAfter:on;
    inDir: inDirIntrinsic + parent:inDir;
    outDir: outDirIntrinsic + parent:outDir;
}

left {
    onDir: deg 180 + parent:right:onDir;
    onLength: parent:right:onLength;
}

/*#md
## Opening Terminal

Drawn from `<left>` to `<right>` using both 'in' properties.
*/
center:i(0)>left {
    in: tension2controlOut on (inDir + deg 180) inTension parent:right:inDir parent:right:on;
}

center:i(0)>right {
    in: tension2controlIn parent:left:on (parent:left:inDir + deg 180) inTension inDir on;
}

/*#md
## Closing Terminal

Drawn from `<right>` to `<left>` using both 'out' values.
*/
center:i(-1)>right {
    out: tension2controlOut on outDir outTension (parent:left:outDir + deg 180) parent:left:on;
}
center:i(-1)>left {
    out: tension2controlIn parent:right:on parent:right:outDir outTension (outDir + deg 180) on;
}

}
