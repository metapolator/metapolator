Metapolator Data and Components
===============================

The first drafts on how *metapolator neue* works.


We will use a CSS like format to store all parameters of needed to generate
a font.

Why make it like CSS?
---------------------

### attracting new users

CSS is well understood. Everybody who made a website had already contact
to it. So it will be easy for many people to see what's going on.

### development

Having a pre-existing example we all know well makes it easier for us to
think about it.

### exchange

* **Prototypo**
Prototypo is a software that creates different outline-fonts from a
programatically defined source-font. The produced outline fonts differ
by their parameters. If Prototypo would save these parameters in the same
format as we do, it could be possible to exchange parameters, making a
workflow prototypo->metapolator even metapolator->prototype possible
to some extend.
* **ANRT -- Automatic Type Design**
At the [Automatic Type Design](http://automatic-type-design.anrt-nancy.fr)
Congress of The Atelier National de Recherche Typographique (ANRT) in Nancy
May 2014 the central question was:
> Can we conceive an OCR workflow that generates typefaces ‘on the fly’,
  from scanned pages of text? What degree of accuracy could then be achieved?
  And to which extent could we automate the type design process?
* Jean-Yves Ramel of the [PaRADIIT](https://sites.google.com/site/paradiitproject/)
Project showed at the ANRTevent that he is about to extract parameters of
printed typefrom historic books using image analysis. By providing a good
documented, extensible and understandable format to exchange these parameters,
we might be able to use his results to re-create old typefaces. I'm not shure
the kind of font needed to improove OCR-systems is the same as one would
use for typesetting.


Fundamentals/Datamodel
----------------------


### Skeleton UFO + CSS
This is the data representation of a master/snapshot:

* It has in its `glyphs` directory (ufo 3 layer `public.default`) the outline
  representation of the font (only when exporting it).
* In the `skeleton` directory (ufo 3 layer maybe `metapolator.skeleton`,
  or to be used as background layer in another app `public.background`)
  The glyphs in this layer have only open contours representing the skeleton.
* If this master was imported from an existing font we should keep the
  original outline data as a reference in a layer.
* A CSS file: Containing all parameters for this font

### The Skeleton
Is the description of our "middle line". We take the number and inital
coordinate of contours and points from it. Initial means we apply the
css/parameter transformations on these values. An author should be able
to open the skeleton layer of a glyph with an UFO-Editor and see what's
going on. (One problem that I have with this is that we are talking about
using hobby curves. While we have solved going from hobby to bezier, the
other way around is not always possible. So editing skeleton curves
-- which are beziers in the UFO -- may yield in results we can't use as
it. If the problem is a show-stopper we should move the hobby curve data
to the glyps lib at `com.metapolaor.skeleton` or so.)

#### Problem:
Beeing very strict about parameters, **the skeleton points are parameters too**.
Especially the coordinates will be overrideable via CSS. We might go so far,
that everything will go into a css-file:

    glyph a {
        contours:2
    }
    
    glyph a contour:nth-child(0) {
        points:5
    }
    
    glyph a contour:nth-child(0) point:nth-child(0) {
        x: 25u
        y: 123u
    }

But this is a bad Idea:

* Point incompatibillities: we have no idea how to interpolate between
  different numbers of points
* we can name our skeleton points using UFO `name` and `identifier`
  attributes. These names can be used as selectors in the css:

        /** totally made up **/
        glyp a point.begin-shoulder {
           x: +3u
           y: calc(get(end-shoulder, y) - 2u)
           tension: 200
        }

### CSS

todo:

* give examples!
* show the project level and the master level. (is there a project level)
* describe possible selectors (tags/classes)
* Show how we get classes from opentype glyph classes
* describe how values are generated on import

Components
----------

### Plugins
The big Question is: How are we going to be prepared for every possible
parameter.
Plugins bring with them a whole bunch of stuff, some things are optional:

 * plugin-api version
 * dependencies on other plugins
 * zero or more Metapost code files (we'll see how to do this)
 * definition of parameters
    * name
    * documentation and tooltips (both accessible via the UI)
    * how to display the value in the ui (this is closely coupled to validation)
      (is it a slider or a switch …)
    * validation rules/ how the value should look like (e.g. number in a range
      of 0 to 1, valid units, etc.) We probably must enable the plugin
      to run javascript code (hooks/callbacks something along that line).
 * Functions to use in the CSS (if this is useful at all)
       
       /* where 'calc' would be a function */
       glyph {
          x-height: calc(12% + 2u)
       }
 * Importer rules, I did not think much of this yet, but, to be able to
   get any arbitrary parameter of a font we need to make the importer
   extensible. This is likeley javascript that registers to some api of
   the importer.
 * ui-elements (maybe not in the first version)




### Importer
Takes a "prepared" UFO and creates a skeleton-UFO and a parameters CSS file.
This process will do validation of the input data.

We might let it import a skeleton-ufo with css, too. 

TODO: words about compatibillity, what is a compatible outline/skeleton





### Editor (UI)


### Broker
provides an api to change the project data. And provides an api to
subscribe to changes on the project data.

### Exporter
Takes a parameters CSS file and a skeleton-UFO and creates a regular UFO.


### Masters and Snapshots
On the Metapolator githup page it says:
"A Master can be compared and interpolated with another Master along an axis."

Technically what we need to create one font is a skeleton and a parameter
file. The union of skeleton and parameter file is what I understand as a
"Master". Technically though, we could call it a "Snapshot", too.


### Interpolation
We will take all parameters of 2 Snapshots/Masters and 





The workflow is round tripped like this:

1. UI uses broker to commission changes on the project data.
* broker takes data and saves it or rejects to save it
  (for whatever reason, conflicts in a multiuser cenario, invalid input etc.)
  There should be feedback to the change issuing entity (ui) so we can know
  if something went wrong, and display an appropirate message.
* when the model changes the broker informs its subscribers, such as the UI.
  The UI updates the changed parts.

With a broker like this

* changes can can com from another source (multiuser)
* The broker decides whether or not to apply a change, so the broker will
  handle with all multiuser issues.


