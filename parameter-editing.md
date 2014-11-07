A further development of the pioneering work [performed earlier](https://github.com/metapolator/metapolator/wiki/elements-of-design#working-with-masters-and-glyphs-in-context). Note the [challenges](https://github.com/metapolator/metapolator/wiki/elements-of-design#challenges) and [the rules](https://github.com/metapolator/metapolator/wiki/elements-of-design#the-rules).

## an interim parameter overview
_—work in progress_

**script** parameters (can be set at script, master and project level)

* [vertical metrics](https://github.com/metapolator/metapolator/wiki/specimen,-and-glyph-interaction#optical-horizontal-lines), always depend on script; for instance for Latin:
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

* the most used unit is, ehm, _unit_ (milliEm); demanding: can be negative, fractions over 4 decades (from 1, 2, 3 to 1000+);
* angles in degrees, 0–360, can be fractions; input handling can keep anything within that range;
* scalers; multipliers without unit (e.g tension and width, but also for all input with scaling (×) operation); normal range: 0–3, but can go towards ∞;
* for point alignments, a list of alignments of the form: “p1-p2:0,0 p3.port.x-p4.starb.x:123 p5.y-p6.y:0”.