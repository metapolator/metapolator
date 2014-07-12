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

## raw images of the wall-of-concept
![](http://mmiworks.net/metapolator/photo01.jpg)
![](http://mmiworks.net/metapolator/photo02.jpg)
![](http://mmiworks.net/metapolator/photo03.jpg)
![](http://mmiworks.net/metapolator/photo04.jpg)
![](http://mmiworks.net/metapolator/photo05.jpg)
![](http://mmiworks.net/metapolator/photo06.jpg)
![](http://mmiworks.net/metapolator/photo07.jpg)