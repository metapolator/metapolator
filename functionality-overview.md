Functionality is the most dry, to-the-point—call it boring—description of what a piece of software does; i.e. its features. It is limited to a description of _what_ it does and leaves out _how_ these are invoked and accomplished; i.e. the user interaction is not part of the functionality.

The functionality overview serves as a checklist for the design process—and the project—to know ’what is in the box’ and answers ‘did we forget anything?’

Below we will go top-down through the Metapolator structure and sum up the functionality that shall be included. Quite a few things will be marked with ‘_(later)_’, meaning it is not scheduled for the october 2014 release.

## working on a project
ƒ— New, Open, Close, Set Name

* if auto-persistence model: Duplicate, Delete, Save local, Open local
* if file model: Save, Save As

github integration: actions TBD (keep it simple for designers, please)

Set/Change/Clear global point/line/glyph [parameter(s)](#parameters).

### drilling down
There are two hierarchies within a project. The first one is **the hierarchy of masters**—
* project
  * master
    * glyph
      * skeleton
        * line
        * point
      * vector shape

i.e. “a project consists of masters, which contain glyphs, made out of skeletons—drawn with lines between points—and vector shapes.”

The second hierarchy is **the hierarchy of metapolation**—

* project
  * design space
    * master
    * master sequence
    * adjustment master
    * adjustment master sequence
    * instance
    * string of instances

i.e. “a project consists of design spaces, which contain, and share, any number of masters, master sequences, adjustment masters and adjustment master sequences. Placed in the design spaces are instances and strings of instances.”

Below, we will exercise these hierarchies.

## working on a master
ƒ— New, Import font, Duplicate, Delete, Copy from other project, Export as font, Set Name, Set Script(s) _(e.g. Latin, Cyrillic, Devanagari)_

Set/Change/Clear [parameter(s)](#parameters) (for whole master or several masters).

### glyph
ƒ— New, Duplicate, Delete, Set char code, Sort

Set/Change/Clear point/line/glyph [parameter(s)](#parameters) (for whole glyph or several glyphs).

### skeleton
ƒ— New, Duplicate, Delete, Translate, Scale, Rotate

Set/Change/Clear point/line/glyph [parameter(s)](#parameters) (for whole skeleton or several skeletons).

#### line
Set/Change/Clear line [parameter(s)](#parameters) (for one or more lines).

#### point
ƒ— Add, Delete

Set/Change/Clear point [parameter(s)](#parameters) (for one or more points).

**note**: position of a point and bezier-type controllers are part of its parameters.

### vector shape
ƒ— Import, New _(later)_, Edit bezier _(later)_, Duplicate, Delete, Translate, Scale, Rotate

### parameters
See also this Zürich [report section](https://github.com/metapolator/metapolator/wiki/the-Zürich-report#parameter-gardening).

* glyph: 20+
* line: one for now: type;
* point: 10+, coordinate pair, 4 are bezier-type controllers, 3 control the pen.

Parameters can be set using operators: scale, offset, hardwire, minimum, maximum.

## working in a design space
ƒ— New, Duplicate, Delete, Set Name

### master
ƒ— Add, Remove, Set Position (in design space)

### master sequence
ƒ— Create from Masters, Delete, Add master, Remove Master, Sort

### adjustment master
ƒ— New, Duplicate, Delete, Set Name, Set Position

Set/Change/Clear adjustment [parameter(s)](#parameters), at master, glyph, skeleton, line, point and/or vector shape level.

**note**: an adjustment master can appear anywhere in a design space and anywhere on adjustment master sequences.

### adjustment master sequence
ƒ— New, Duplicate, Delete, Span (on master sequences and stings of instances)

### instance
ƒ— New, Delete, Set Metapolation (i.e. mix of masters), Set Name, Export as font

### string of instances
ƒ— New, Duplicate, Set # instances, Set Name Scheme, Span (in design space), Adjust instance position

## font families
ƒ— New, Delete, Map instances and strings of instances, Map meta data, Export

## type design evaluation
ƒ— Set length (few glyphs–paragraphs, Set Size, Set characters of interest, Set Mix (generic text vs. chars of interest), Print Evaluation Kit

**for**: masters, master sequences, adjustment masters, adjustment master sequences, instances, strings of instances—and combinations of these.

## finishing
* kerning _(later)_
* hinting _(later)_

## meta data
ƒ— New, Duplicate, Duplicate from other project & Adapt (substitute font names), Delete

## utility
aka the garbage can department, everything that does not fit above is gathered here.

Undo (of edit steps on any data)

Cut, Copy and Paste of—

* glyphs
* skeletons
* vector shapes
* parameter+value pairs