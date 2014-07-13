![](http://mmiworks.net/metapolator/allwall.jpg)
<br/>_nicolas pauly (r) and peter sikking working on the wall-of-concept._

This is a visual report, with notes, of the 2-day Metapolator product workshop that took place on 9+10 July, 2014 at the Type Designers Studio, Zürich, Switzerland. Involved where Simon Egli and peter sikking, with contributions by nicolas pauly, Wei Huang (remote) and Eben Sorkin (via [this](https://plus.google.com/106288796449831139244/posts/W874iEgTcxM)).

Now where to start, there is so much we covered in these two days…

## of master sequences and sausages
First thing we worked on was that masters in a design space are more often than not related to each other. They can form sequences (think thin–medium–bold, but also a thin-italic-narrow-sans to heavy-wide-slab sequence).

![](http://mmiworks.net/metapolator/sequences2.jpg)

Out of 3-or-more masters a sequence can be auto-detected (all significant changes of parameters line up for them) and any 2-or-more can be made a sequence by users. Master sequences are shown as lines in design space.

**notes** (see numbers in image above):

1. if there are two sequences, they either cross at some point (not necessarily at some master) or not;
* some crossing (and not) of 3 sequences;
* a red ‘string of instances’ (4 of them) is spanned over a 3-sequences design space;
* some crossing (and not) of 4 sequences;
* force fields around some sequences (aka sausages) and single masters make up a design space.

![](http://mmiworks.net/metapolator/tricky.jpg)

In a way, too many master sequences can be automatically detected in a 9-master setup like this. 

## overrides and adjustments
Next, we discussed ways of fine-tuning in Metapolator, Simon explained a system of overrides to manipulate parameters of a master on a more detailed level (glyph, sub-glyph). We fleshed out the operators to something simple but powerful:

* scale, multiply the original value with factors greater or smaller than 1;
* offset, add or subtract a value;
* fixed, set it hard to a noter value;
* limit, set an upper or lower limit to the original value.

Overrides can be combined (say a scale and a limit).

![](http://mmiworks.net/metapolator/overrides.jpg)

**notes** (see numbers in image above):

1. some of the operators;
2. the original mail by Vernon Adams with an idea based on drum sequencers, to apply something to part of a sequence.

So we went to work with Vernon’s idea. This part of a sequence can be (only) in the design space (here two master sequences cross):

![](http://mmiworks.net/metapolator/adjustment.jpg)

**notes** (see numbers in image above):

1. the single red dot is an adjustment master, the concept made in Valencia while talking to Octavio Pardo; it changes one or more parameters (all glyphs, some glyph(s) and/or sub-glyph) while leaving the rest alone; an adjustment master on its own can appear anywhere in the design space and influences the space via its force field, just like any other master;
* the red line is an adjustment sequence, defined by one or more adjustment masters, which can be applied to lines in the design space (master sequences and strings of instances); all along the adjustment sequence the parameter change(s) hold.

Now we can return to the **first image** for some examples (see letters):

a. change of parameter by the force field of an adjustment master;<br/>
b. applying an offset to a parameter with an adjustment sequence;<br/>
c. this can be done with two adjustment masters (one offset, one scaling) on an adjustment sequence;<br/>
d. bit of a different view, here the parameter rises over a master sequences, and then is clamped to a maximum limit for a certain adjustment range.

We have seen now how discontinuities can be built into metapolation.

## vector shapes
We spent some time on vector shapes. In general one can say that we have to achieve near-100% coverage of existing and future fonts with skeletons and parameters. Only then the future of font making will be unlocked. But there needs to be a backup for those parts that will not fit the skeleton model.

Vector shapes can be seen as ornaments, glued to the main skeletons-and-parameters mass of a glyph.

![](http://mmiworks.net/metapolator/shapes.jpg)

**notes** (see numbers in image above):

1. problem nr.1: the dot on the ‘i’ (in general: pure elliptical shapes);
* an Ionic end-cap, with glue points (to a stroke);
* any vector shape can be enclosed by a rectangle, which makes it parameterisable; now the glue points can steer the transformation of the vector shape, when the connected stroke changes;
* putting it all together; a tiny (1 milliEm) overlap must be included to avoid seams at any font size.

**postscript**: on the way to the airport Simon and I discussed that it must be possible to get rid of vector shapes altogether; if it can be enclosed by a bezier, why could it not have been drawn by a ‘special, thick, felt-tip pen’?

I personally say: let’s get it over with with the ellipses: allow for a point skeleton that then can be stroked 360° (with aspect ratio, which can be rotated).

For any arbitrary shape I say: concentrate on starving it, shrinking it down to a hairline version. That is what the skeleton should look like. Take it from there.

## hierarchy, hierarchy, hierarchy
Over these two days we spent quite some time putting it all together.

![](http://mmiworks.net/metapolator/hierarchy.jpg)

There are two hierarchies in Metapolator. The first one is **the hierarchy of masters**—
* project
  * master
    * glyph
      * skeleton
        * line
        * point
      * vector shape

i.e. “a project consists of masters, which contain glyphs, made out of skeletons—drawn with lines between points—and vector shapes.”

**Making changes means setting parameters.<br/>The natural way to make changes is at _master_ level**.<br/>This is where the speed increase that Metapolator promises is created.

To make even more sweeping changes parameters can be applied at project level. Setting parameters at sub-master level is applying overrides, i.e. corrections to get the details _just right_.

User will be able to multiple select _at the same hierarchy level_ and apply/change parameters. This also beyond the direct parent context of said level. Examples—

* multi-select points in several glyphs of a master;
* multi-select points in several masters;
* multi-select skeleton parts (aka strokes) in several glyphs of a master.

Based on my observation of the activity of font-making and the evaluation of font construction applications, I added the following **convenience sets**—

* master sets
* glyph sets
* skeleton sets

**notes** (see numbers in image above):

1. whenever several masters get multi-selected **and** parameters get applied/changed, the masters involved get added to the list of **master sets**;
* there is no burden for users to administrate the list of master sets, but if they want to rename a master set to denote its role, they can;
* whenever several glyphs get multi-selected **and** parameters get applied/changed, the glyphs involved get added to the list of **glyphs sets**; again can be renamed or shown as-is;
* whenever several skeleton parts get multi-selected **and** parameters get applied/changed, the skeleton parts involved get added to the list of **skeleton sets**.

Each of the sets can be used to quickly reinstate any of the multiple selections, to apply/change parameters again.

Combining, even driving, the skeleton sets with the fact that skeleton parts can be easily copy+pasted across glyphs—and maybe even dropped on a skeleton _scratchpad_ and then dropped again from the scratchpad on any glyph for quick construction—and we have a system that substitutes the component system of other applications, without the cramped condition that related parts **must** all change in unison.

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

## raw images of the wall-of-concept
![](http://mmiworks.net/metapolator/photo01.jpg)
![](http://mmiworks.net/metapolator/photo02.jpg)
![](http://mmiworks.net/metapolator/photo03.jpg)
![](http://mmiworks.net/metapolator/photo04.jpg)
![](http://mmiworks.net/metapolator/photo05.jpg)
![](http://mmiworks.net/metapolator/photo06.jpg)
![](http://mmiworks.net/metapolator/photo07.jpg)