Metapolator Concepts
====================

The first drafts on how *Metapolator neue* works.


Terms/Fundamentals/Data-model
-----------------------------

### Center Line (Middle Line)

Taking an outline with an equal number of points as input, we create a
new line by averaging the coordinates of each left-and-right point pair.
The resulting list of new points is the Center Line. Center Line is a
function of the outline.

### Skeleton

When [importing a font from outlines](https://github.com/metapolator/metapolator/wiki/outline-import), 
we create an initial skeleton using
the "Center Line". However, the skeleton and the parameters can be changed
in several ways and a new outline will be created from that. The new
outline will have a new middle line. The new middle line can differ from
the skeleton, because the left-and-right point pairs can have different
distances to their skeleton origin point. If we'd create a new skeleton
from that new outline using its middle line, the new skeleton would differ
from the original skeleton.

**The Skeleton is the base on that we work with glyphs. The Center Line
always follows the outline.**

The Skeleton consists of the number of contours and points and the initial
x and y values of the points. Initial means we apply the CPS/parameter
transformations onto these values, the skeleton provides absolute coordinates,
so that the CPS can stay in the relative realm. An author should be able
to open the skeleton-layer of a glyph with an UFO-Editor and see what's
going on.

One problem is that we are talking about using hobby curves. While we have
solved going from hobby to bézier [and from beziér to hobby](https://github.com/metapolator/metapolator/issues/114)
(using metaposts `posttension` and `pretension`) the latter is not always
possible. So editing skeleton curves -- which are béziers in the UFO --
may yield in results we can't use as it. However, we believe that Hobby's
Splines are mighty enough and that they may be helpful by preventing a lot
of technically bad curves, that can be made with beziérs.

### Master/Metamaster

Masters is what we deal with inside of Metapolator. We could view Masters
as fixed points in the design space. A Master consists of a Skeleton and
a set of parameters that describe how to create an outline for each glyph.
Any two masters of a Metapolator project share the same "Essence", that
means it can be interpolated between them.

### Metamaster

A Metamaster is a Master in the Metapolator world. If its obvious that we
are talking about Masters in Metapolator the simpler term "Master" is
sufficient. When talking about Masters from other font interpolation
solutions, too, (like Multiple Masters) we can be more specific and use
Metamaster, 

### Instance

The exported result of working with Metapolator. An instance can be the
result of an interpolation or just an export of a Master. The glyphs of
an instance have an outline as most important feature.

### Essence

All the things between any two masters that must be compatible for
Metapalation. Conceptionally, all Masters in one Metapolator project share
the same Essence. Two masters of different Metapolator projects, can
share the same Essence.

We can use the term Essence, to document what must be compatible for
metapolation.

**compatible:** When two Masters are compatible they

* define the same glyphs, that are compatible to their "partners"
* the glyph pairs have the same number of contours, where the contours 
  at the same position are compatible to each other
* compatible contours share the same points/commands in the same order
* the glyphs have the same anchors (and guides, what to do with ids and names?
  it would be good to have a Prepolator for Metapolator) I would prefer
  to be very strict on this and add the Identifiers and names to the Essence.
* **the coordinates of points, anchors, guides may differ**
* *we should make this list complete*

### Design Space

Metaphysical: all Masters that share the same Essence belong to the same
design space. Mathematical: Design Space is the set of all Masters that
share the same essence.

Real World: One Metapolator project will define a Design Space where we
can pinpoint some locations. These Locations are called masters. With
interpolation and extrapolation we can explore the space between and beyond
the masters.



### UFO + Skeleton + CPS
[Here's a discussion about how the data is going to be serialized/represented on disc.](./metapolator-project-file-format.md)

### CPS -- Cascading Parameter Sheets

[Here's a more in detail documentation of CPS](./cascading-parameter-sheets.md)

#### Sources of values, global and local values

In theory we could have all parameters of a project in one global file.
This however would lead on the one hand to longer selectors, because we
would have to select the specific masters most of the time. On the other
hand the one parameter file would grow very large on big projects and thus
become harder to maintain.

I propose a standard structure, where each master includes the global
CPS-file and thereafter a master-specific local CPS-file. The local CPS-file
will override global rules if they have the same
[specificity](http://www.w3.org/TR/2011/REC-CSS2-20110607/cascade.html#specificity)

Following this the sources of parameter-values are stacked for each master as
in the following list. Where the latter entries override the earlier:

1. **default value** (this comes from the plugin that defines the parameter)
  This data will be available using `parameter-name:auto;`
* **skeleton data** (especially the coordinates of the skeleton points
  and if possible tension and direction values. *¿however these may be specific 
  for the left and right point of each skeleton and thus go rather into 
  the local.cps? Maybe we could get the `auto` tension from here.)* This
  data will be available using `parameter-name:auto;` and thus overshadow the
  parameter default value.
* **global.cps** empty when starting a new project.
* **local.cps** Each master has one of these, this is filled the first time
  by the [Importer](https://github.com/metapolator/metapolator/wiki/outline-import). The selectors from the importer are as short/unspecific as 
  possible, so it should be possible to override values from global.cps.*(Does 
  this make sense? Or should we have a 3. local-1.cps 4. global.cps 5. local-2.cps
  structure, where local-1.cps would hold the values of the importer?)*

#### Possible Selectors

*probably incomplete*

***TODO: make up an example here*

**tags/elements:** master, glyph, guideline, anchor, contour, point *Should
  we use other tags for guidelines defined in `fontinfo.plist` than for
  guidelines defined in the glyphs? We could also use `fontinfo guideline`
  and `glyph guideline` to differentiate, which is much more in the spirit
  of CSS*

**ids** always start with a hash-sign "#". I personally dislike ids in
HTML+CSS because they usually tend to break things sooner or later, due
to their nature of uniqueness. However, in our case we should reuse the
ids that UFOv3 brings with it. These ids are not globally unique for one
project, neither within one master/UFO but only unique within a
glyph or the fontinfo.plist. We could use the glyph-names from
`contents.plist`, too. However, a user *might* expect to select one single
entity using an id like `#a{ param=val;}`, but in fact from global.css would
select all the glyphs named `a` in every master **AND** all entities
within all glyphs having the identifier `a` like: `<guideline idntifier="a"
y="-12" name="overshoot"/>`. Thus, to make the most reasonable thing,
**one should select all glyphs named a like this:** `glyph#a{ param=val; }`
This excludes `guideline` etc. from the selection. **Important: the UFO
spec says:**
>"*Authoring tools should not make assumptions about the validity
of a glyph's name for a particular font specification.*"

So maybe we wan't to create our own glyph-name to id algorithm,
similar to UFOs [user-name to filename convention](http://unifiedfontobject.org/versions/ufo3/conventions.html#usernametofilename)

**classes** always start with a dot `.` For different elements 
the sources of their "class-names" differ.

* Masters will have a class field in the `lib.plist` file.
* Glyph classes can be defined directly in the `groups.plist` file. So
  we have a powerful way to select just the Latin glyphs:
  `glyph.latin{ x-height:value }`
* guides, anchors, contour, point: we should use the UFO `name` attribute
  of these. *This might lead to problems due to double usage of the name
  attribute. How do other people use the name field? The problem is, that
  the usual CSS-class comes from the HTML-class-attribute which allows white
  space if you need multiple classes for one element. This is a good thing
  and we should have that, too, but it may yield in long labels in some 
  editors. If this is a problem: A) the author should restrict himself to
  pleasing names but looses expressiveness B) we should try to get a "class"
  attribute into UFOv4*
* What is missing?
* Do we need a way to get glyph classes from the `features.fea` file? If yes,
  would just copy them into `groups.plist`? Is there a parser available
  for the [Adobe OpenType Feature File Specification](http://www.adobe.com/devnet/opentype/afdko/topic_feature_file_syntax.html)

**attribute selectors** we should do, if we find a use for it

### Why make it like CSS?


#### it fits well
See the description above and check it yourself. If there is a point that
doesn't work PLEASE discuss it with us.

#### attracting new users

CSS is well understood. Everybody who made a website had already contact
to it. So it will be easy for many people to see what's going on.

#### development

* Having a preexisting example that we all know makes it easier for us to
think about it.
* CSS parsers are available

#### exchange

* **Prototypo**
Prototypo is a software that creates different outline-fonts from a
source-font defined by a program. The produced outline fonts differ
by their parameters. If Prototypo would save these parameters in the same
format as we do, it could be possible to exchange parameters, making a
workflow Prototypo->Metapolator even Metapolator->Prototypo possible
to some extend.
* **ANRT -- Automatic Type Design**
At the [Automatic Type Design](http://automatic-type-design.anrt-nancy.fr)
Congress of The Atelier National de Recherche Typographique (ANRT) in Nancy
May 2014 the central question was:
> Can we conceive an OCR workflow that generates typefaces ‘on the fly’,
  from scanned pages of text? What degree of accuracy could then be achieved?
  And to which extent could we automate the type design process?
* Jean-Yves Ramel of the [PaRADIIT](https://sites.google.com/site/paradiitproject/)
Project showed at the ANRT event that he is about to extract parameters of
printed type from historic books using image analysis. By providing a good
documented, extensible and understandable format to exchange these parameters,
we might be able to use his results to re-create old typefaces. Although, I'm
not sure if the kind of font needed to improve OCR-systems is the same as one
would use for typesetting.


Components
----------

### Plugins
Q: How are we going to be prepared for every possible parameter?

A: Plugins bring them in and a whole bunch of of other stuff, some things are optional:

 * plugin-API version
 * dependencies on other plugins
 * zero or more Metapost code files (we'll see how to do this)
 * definition of parameters
    * name
    * documentation and tooltips (both accessible via the UI)
    * how to display the value in the UI, is it a slider or a switch …
    (this is closely coupled to validation)
    * validation rules/ how the value should look like (e.g. number in a range
      of 0 to 1, valid units, etc.) We probably must enable the plugin
      to run JavaScript code (hooks/callbacks something along that line).
 * Functions to use in the CPS (if this is useful at all)
       
       /* where 'calc' would be a function */
       glyph {
          x-height: calc(12% + 2u)
       }
 * [Importer](https://github.com/metapolator/metapolator/wiki/outline-import) rules, I did not think much of this yet, but, to be able to
   get any arbitrary parameter of a font we need to make the importer
   extensible. This is likely JavaScript that registers to some API of
   the importer.
 * UI-elements (maybe not in the first version)




### [Importer](https://github.com/metapolator/metapolator/wiki/outline-import)
Takes a "prepared" UFO and creates a skeleton-UFO and a CPS parameters file.
This process will do validation of the input data.
It must be possible to import UFOs that we exported from Metapolator
(UFO with skeleton and CPS) So we can tweak by hand when the interface
development is behind or whatever. We'll make this fully functional only
for UFOv3 exports, because UFOv3 can hold all our data.

#### TODO: How values are generated on import

### Editor (UI)
I think we need different main interfaces *(incomplete list)*:

* import: things can go wrong here, so this must be an iterative 
  process that cooperates with the user.
* Master management: create Masters (by import, by copy, by pinpointing 
  a position in interpolation space), name Masters etc.
* parameter mode: change parameters of one Master
* interpolation space: setup Masters in the interpolation space as
  Masters and define which axes to travel when exporting. Define 
  at which positions Masterss are exported.
* diff viewer and merge tool (*or whatever we need to make history/revision
  management*)


### Broker
provides an API to change the project data. And provides an API to
subscribe to changes on the project data. We'll likely end up having
different broker implementations for offline/single user editing and
multiuser/online editing (the latter requires one broker on the server and
the broker on the client will be different, too). 

#### Preparation for multiuser etc.

The workflow is round tripped like this:

1. UI uses broker to commission changes on the project data.
* broker takes data and saves it or rejects to save it
  (for whatever reason, conflicts in a multiuser scenario, invalid input etc.)
  There should be feedback to the change issuing entity (e.g. the UI) so
  we can notify the user if something went wrong, and display an
  appropriate message if necessary.
* when the model changes the broker informs its subscribers, such as the UI.
  The UI updates the changed parts.

With a broker like this

* changes can can com from another source (multiuser)
* The broker decides whether or not to apply a change, so the broker will
  handle all multiuser issues.
* we can set up different interfaces (UI, CLI, API without having to
  rewrite everything)

### MOM -- Metapolator Object Model
The Model is from one point of view an API of the Broker. On the other
Hand we will create an Object-Model To represent the different aspects of
Metapolator and to attach programing interfaces to that data representation.
One part of the Model is the CPS or parameters Model. Another very big
part will be the UFO-Model (unified font object). The structure of the 
UFO-model will be conceptually similar to [UFOv3](http://unifiedfontobject.org/)



### Interpolator
The result of the interpolation between 2 or more masters at a position
is always a Master.

We will take all parameters of 2 or more Masters and interpolate between
the values we receive from the CPS and the other values of the UFO that
need interpolation, this is not the outlines because these are coming via
Metapost.

To create a new Master to be used as Master or for export:

1. interpolate the skeletons
* interpolate the local CPS-files. a Master created from interpolation
will thus have a new skeleton, if the skeletons of the parents are different,
and a new local CPS file. The global CPS needs no interpolation.
* Some other values of the UFO will need interpolation (like fontinfo.plist
guidelines)

There should be an optimized path when only a subset of glyphs is needed
i.E. for previews.

### Metapost
To create the outlines of a Master, we create a canonical parameter
representation for each needed glyph. and then create together with our
plugins a Metapost file containing the **already interpolated canonical**
values and all Metapost code needed to generate the outline. This is
different to how the current prototype works. The current prototype
interpolates the values of 4(hard coded) masters within Metapost.

### Exporter
The Exporter creates instances from a Masters (which can be the result of
a metapolation). The instance has the outlines for each glyph. We can always
export UFOv2 and UFOv3 from our Masters. The Skeleton layer and global
and local CPS file will be present in the UFOv3, so it is possible to
recreate the outlines without having the complete Metapolator Project
available. The outlines will be the result of Metapost fed with the data
of Skeleton+CPS+our metapost code. So the file is pretty much self-contained.

To make real fonts we use the UFOv2 Instance with existing tools.
