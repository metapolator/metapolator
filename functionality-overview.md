Functionality is the most dry, to-the-point—call it boring—description of what a piece of software does; i.e. its features. It is limited to a description of _what_ it does and leaves out _how_ these are invoked and accomplished; i.e. the user interaction is not part of the functionality.

The functionality overview serves as a checklist for the design process—and the project—to know ’what is in the box’ and answers ‘did we forget anything?’

Below we will go top-down through the Metapolator structure and sum up the functionality that shall be included. Quite a few things will be marked with ‘_(later)_’, meaning it is not scheduled for the october 2014 release.

## working on a project

project: New, Delete, History (an auto-persistence model, that records a project history of each re/un-do action and allows marking milestones/revisions)

github integration: actions TBD (keep it simple for designers, please)

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

### glyph

### skeleton

#### line

#### point

### shape

## working on a design space

### master

### master sequence

### adjustment master

### adjustment master sequence

### instance

### string of instances

## finishing



## utility
aka the garbage can department, everything that does not fit above is gathered here.