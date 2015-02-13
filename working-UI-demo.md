This page contains the design deltas for the working UI demo of February–March 2015, as compared to the contemporary overall interaction design. The working UI demo is an MVP (minimal viable product), meant to wrap up the current project phase, and to enable the next phase.

Naturally this will stick closely to what has been achieved up to now and what will be done for minipolator. Some of the choices that have to be made will hurt, but it will enable us to make something that can be useful to font designers.

In general the working UI demo must be visual-designed, really communicating that people with visual design acumen work on this, but it should not look finished. The message should be in every way, also visually: this is just a start.

This page is organised by UI section and will be refined just-in-time for development.

## project + view control panel
If there is a back-end for metapolator project files, then we can do some basic Open and Save; if not we bite the bullet and work with no projects: one-shot editing. view control is done, apart from a bit of fine-tuning.

### local menu
_When_ there is metapolator project file I/O, the local menu is as follows:

* New
* Open…
* -- \<separator\> --
* Close
* Save
* Save As…

When not:

* New
* -- \<separator\> --
* Close

## parameters panel
Her is the list of parameters we support:

* Width
* Height
* Slant
* Tension (modifies in & out)
* Weight
* horizontal metrics _(all measured to skeleton)_
  * spacing _(total space surrounding this glyph, = front + back)_
  * sidebearings _(value pair, e.g. “40|30”, = front|back, **not** left|right)_
* X-height _(tricky, works only for latin and needs preparation in the incoming ufo)_

These work on the selections that can be made in the specimen, i.e. (multiple) masters and (multiple) glyphs. We can make a nice interim design for this panel, something very simple with a hint of things to come.

**local menu**: none

## specimen + glyph editor panel
Forget about any direct-manipulation (i.e. with the mouse) parameter editing, or of making selections on sub-glyph (e.g. stroke, point) level. What is performed in the specimen is (multiple) selections of glyphs, to individually adjust these (whole glyphs). There is no glyph management (e.g. Add or Delete glyph from master).

Our pain is changing glyphs in real-time, maybe we can show only 2, 3, or 5 glyphs that get their weight or width changed. These can still be mixed with other glyphs that are static (because they belong to another master, or are not part of the selection). The filter of the specimen needs to be re-jigged to show only those few chars that we can handle.

**local menu**: none

## masters column
Stand-alone masters only; forget about master sequences and adjustment master (sequences). This saves us from a lot of exponential complexity, especially in the design spaces panel. Simon and I will come up with a (picture) glimpse of things to come for the adjustment master list. It should be possible in this working UI demo to load one ufo and create a total of 5 masters out of it (width and height variations).

### local menu
The local menu is as follows:

* Import ufo…
* -- \<separator\> --
* Duplicate
* -- \<separator\> --
* Delete…

## design spaces panel
Here we can now see how much work we saved us in the masters column. The control design space can be rigged up with simple sliders and triangles (+Jeroen Breen demoed them). The sliders work in one specific mode, detailed below.

Optional: explore spaces (we look pretty close to having that working too).

### control space sliders
Since there are only stand-alone masters, only simple mixing of masters (e.g. 50% bold, 50% italic) can be performed. Feature stacking (100% bold **and** 100% italic) is the realm of mater sequences and cannot be performed. To further the do-more-with-less vibe, the configuration possibilities of the slider group was decimated and a new default behaviour picked: **one-master centric**:

![](http://mmiworks.net/metapolator/centric3.png)

* When 3 or more masters have been dropped on the control design space, one of them is shown on the lefthand side of _all_ sliders; all other masters are set in relation to this one, by the sliders; _this quite suits font designers, who tend to start their thinking from an ‘origin’ (say, the Regular font) and branch out from there—bolder, thinner, wider, etc._
* the popup on the lower-lefthand side contains all dropped masters, in the order they were dropped, and allow any of these to be picked as the ‘lefthand master’; the default is the first master that was dropped on this design space; _in the example above it is possible to set up the sliders Regular-centric (shown), Bold-centric and Italic-centric_; when the lefthand master is changed, the slider setting are recalculated from the current metapolation coefficients;
* all other masters are listed on the righthand side of the sliders, top–to–bottom in the order they were dropped;
* for every additional master dropped on this design space, one additional slider is created; its default setting is 50%;
* numerical input/output under the slider:
  * only one decimal point is to be shown;
  * since the slider has a resolution of 0.5% all values input by slider show exactly this resolution;
  * values that are typed in by users or a result from calculation (from metapolation coefficients) can be any, single-decimal, value.

After dropping the first master the design space looks like this:

![](http://mmiworks.net/metapolator/centric1.png)

and after the second like this:

![](http://mmiworks.net/metapolator/centric2.png)

a simple slider with no configuration.

![](http://mmiworks.net/metapolator/centricX.png)

Righthand-side masters can be removed _(it is logical that removing the lefthand-side one involves a prior step of setting what the new centre of thinking is)_. When the mouse hovers the label of a righthand-side master, and after a 500ms timeout, a closing box appears nest to it. Clicking it **removes the master from the metapolation of every instance that lives on this design space**.

#### metapolation math
To calculate the metapolation, express all the righthand side masters in terms of the lefthand master:

M<sub>x</sub> = (slider %) / (1.005 - slider %) × M<sub>lh</sub>

substitue all these in the 100% rule and solve for M<sub>lh</sub>; then all other master coefficients follow. _(the 0.005 extra in the denominator avoids divide-by-zero at the 100% slider setting—while giving an error, and 100% value, that is tuned to the fact that the resolution of the slider is 0.5%.)_

A **special case** rises when **all sliders are set to 100%**. In that case M<sub>lh</sub> is hard-set to zero, and all other masters equally divide the 100%.

### local menu
The **local menu** is placed on the active tab, and contains these items:

* New
* Duplicate
* -- \<separator\> --
* Delete…

## specimen panel (metapolation)
even more pain with doing this in real-time. Same, or even tougher, limits (re: parameter specimen) on how few glyphs we can show changing (surrounded by static masters and instances, again).

**local menu**: none

## instances column
Stand-alone instances only; This saves the complication of family handling, also in the design spaces. Working with 8 instances should not be a problem.

### local menu
The local menu is as follows:

* New
* Duplicate
* -- \<separator\> --
* Delete…

## font export panel
Simple manual opentype mapping, good chance that we can do it. I will design something super-simple that warns how long a font export will take (estimate): “this export will take approximately 3 hours, 43 minutes.” ah, and a progress bar while it is exporting.

### local menu
The local menu is as follows:

* Check All
* Uncheck All
* -- \<separator\> --
* Copy Opentype Features from Master…
* Copy Opentype Features from Font…
* Load Opentype Features File…

## metadata panel
Completely forgetaboutit. This is not easily dealt with. Simon and I will come up with a (picture) glimpse of things to come for metadata.

## miscellaneous
An important but invisible category of interaction that we can forget about for the working UI demo is copy & paste (e.g. of masters, instances), and undo. That is a tough portion of development work.﻿