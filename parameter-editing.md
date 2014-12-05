A further development of the pioneering work [performed earlier](https://github.com/metapolator/metapolator/wiki/elements-of-design#working-with-masters-and-glyphs-in-context). Note the [challenges](https://github.com/metapolator/metapolator/wiki/elements-of-design#challenges) and [the rules](https://github.com/metapolator/metapolator/wiki/elements-of-design#the-rules).

## an interim parameter overview
_—work in progress_

**script** parameters (can be set at script, master and project level)

* [vertical metrics](https://github.com/metapolator/metapolator/wiki/specimen,-and-glyph-interaction#optical-horizontal-lines), always depend on the script; for instance for Latin:
  * cap-height
  * x-height
  * ascender
  * descender

**glyph** parameters (can be set at glyph, script, master and project level)

* slant
* horizontal metrics
  * spacing _(total space surrounding this glyph, = front + back)_
  * sidebearings _(value pair, e.g. “40|30”, = front|back, **not** left|right)_
* point alignments _(aka point-nailing, fka penshifted)_; [see here](https://github.com/metapolator/metapolator/wiki/specimen,-and-glyph-interaction#point-alignments)

**stroke** parameters (can be set at stroke, glyph, script, master and project level)

* width _(scales horizontally)_
* height _(scales vertically)_
* rotation

<a name="nobrainer"></a>**no-brainer rule**: when width, height, or rotation are operated on at glyph level or up, then the complete glyph is scaled or rotated—not just the individual strokes—which most likely involves also translating strokes.

**point** parameters (can be set at point, stroke, glyph, script, master and project level)

* skeleton
  * x
  * y
  * direction in
  * direction out
  * tension in
  * tension out
* pen
  * weight
  * port|starboard _(value pair, e.g. “12|10”, = left & right weight, looking in the direction in which the pen moves)_
  * angle
  * kink _(port-starboard angle difference)_

**vector shape** parameters (can be set at vector shape, glyph, script, master and project level)

* x
* y
* width _(scales horizontally)_
* height _(scales vertically)_
* rotation

**note**: also here the [no-brainer rule](#nobrainer) holds for width, height and rotation.

## types and units
Parameters use the following units:

* the most used unit is, ehm, _unit_ (milliEm); demanding: can be negative, fractions and spans 4 decades (from 1, 2, 3 to 1000+);
* angles in degrees, 0–360, can be fractions; input handling can keep anything within that range;
* scalers; multipliers without unit (e.g tension and width, but also for all input with scaling (×) operation); normal range: 0–3, but can veer towards ∞;
* for point alignments, a list of alignments of the form: “p1-p2:0,0 p3.port.x-p4.starb.x:123 p5.y-p6.y:0”, where the numbers are units.

## analysis
A closer look at how cascading parameter editing work shows the following picture.

First of all, the hierarchy:

* project
  * master (1–20)
    * script (1–20)
      * glyph (normally hundreds, could be tens of thousands)
        * stroke (fka skeleton, or segment; 1–20)
          * line (1–10)
          * point (1–10)
        * vector shape (1–10)

The numbers between brackets show an estimate of the _normal_ number of children that are added to each parent at that level of hierarchy. Two things stand out: the one–to–four orders of magnitude more children at glyph level than elsewhere, and that the depth of the hierarchy makes that one can easily end up with one million points per project, and that is a _normal_ situation. That means the further up the hierarchy, the more laborious it becomes to iterate over all the points.

### input, output
When users edit parameters, they either work on one node in the hierarchy,or several nodes on the same hierarchy level. Let us looks at single node editing first. Two things **can** happen at any node—

1. there **can be** native parameters, which effective values drive the computation of the master; from the [parameter overview](https://github.com/metapolator/metapolator/wiki/parameter-editing#an-interim-parameter-overview) above we can see that _spacing_ is native to glyph level and _direction out_ to point level;
* there **can be** parameter input using the triplet of parameter-operator-value, either for parameters that are native to this node, or are native to lower hierarchy levels.

From this we can multiply out the various jobs the UI has to perform:

1. show the effective value of all parameters that are native to this node;
* for all these native parameters show the trail of parameter input that results in this effective value;
* highlight the input at his node for native parameters, because it is unique, i.e. local to this node;
* show the parameter input at this node that is effective at lower hierarchy levels.

### the special one
No, not José Mourinho; it is the glyph level that is the special one in the hierarchy. This has several reasons:

* as mentioned [above](#analysis), at this level the hierarchy explodes—so many glyphs per script; the pain of many glyphs and working with them is even referred to in the product vision;
* this is the lowest hierarchy level that **works as a means of communication**; a glyph is more than composition of strokes and ornaments, it is a letter/sign that has a pronunciation in every language that uses that script;
* this is _also_ the lowest hierarchy level that **works as an aesthetic unit**, for font designers, typographers and readers/viewers;
* when we analyse the hierarchy levels above and below glyph level, we see—
  * the **sub-glyph** levels (stroke, line, point, vector) are all about construction parts; nuts and bolts; taking care of details;
  * the **super-glyph** levels (script, master, project) are all collections—of glyphs—that have to work _together_ as a system, they are also all about working faster, in big broad strokes.