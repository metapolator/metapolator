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
