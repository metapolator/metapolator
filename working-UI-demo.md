This page contains the design deltas for the working UI demo of February–March 2015, as compared to the [contemporary overall interaction design](https://github.com/metapolator/metapolator/wiki/elements-of-design). The [working UI demo](http://metapolator.com/slider/) is an MVP (minimal viable product), meant to wrap up the current project phase, and to enable the next phase.

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
Forget about any direct-manipulation (i.e. with the mouse), direct specimen text editing, parameter editing, or about making selections on sub-glyph (e.g. stroke, point) level. What is performed in the specimen is (multiple) selections of glyphs, to individually adjust these (whole glyphs). There is no glyph management (e.g. Add or Delete glyph from master), i.e. forget about the bottom bar with buttons and glyph code editing. For the filter there is no guarantee of completeness, nor a popup menu;

### updating the specimen after a parameter change
**common sense rule #1**: glyphs that are not visible, or have not been changed, do not need to be recalculated.

The procedure to update the specimen is dependant on bot the number of glyphs that have to be updated and the rate at which glyphs can be recalculated, the latter is of course dependant on the machine that Metapolator runs on. **rule**: this rate needs to be determined at runtime. For instance this can be done with a dummy operation after loading the ufo. The rate is called **recalc rate**.

From the number of visible glyphs that have a parameter changed and recalc rate, **expected update time** can be calculated (visible glyphs changed / recalc rate).

**rule**: if the expected update time is less than 1 second, then _just do it_; calculate the glyphs and update the display.

#### expected update time is greater than 1 second
A progress indication needs to be shown. We will put it inline with the glyphs, instead of putting a progress bar in front of them. The selection indicators (shown here in blue)—

![](http://mmiworks.net/metapolator/selectunder.png)

are repurposed for this (example color: red):

![](http://mmiworks.net/metapolator/updateunder.png)

The same staying-out-of-the-way factor of the selection highlight is used for the update. Specifically, it is exactly the same linen just with a different color.

Every glyph that still needs to be updated is highlighted with the update color. _in practice this means that when there is a selection, the highlight changes from ‘selected’ to ‘updating’. When a whole master is having a parameter change, all its glyphs receive the ‘updating’ highlight (**note*** common sense rule #1 above about the work it takes to update a whole master…)._

Updating is done in reading direction—
* when a glyph is recalculated, all its visible instances are updated;
* as soon as a glyph instance is updated, its ‘updating’ highlight is removed, revealing either the selection highlight, or the specimen background;
* then go to the next glyph to be updated.

_The resulting effect after a parameter change is the appearance of an ‘updating’ highlight under all relevant glyphs—showing the amount of work to be done—followed by the steady disappearance of these highlights—showing the progress of the work and confirming which ones are up to date—–ending with the removal of the last ‘updating’ highlight._

**note**: the backend can sometimes be forced to perform a big recalc (e.g. cache invalidation). the expected update time is then meaningless, and certain to be exceeded, so then update indication is to be used for sure.

#### there is invisible and there is _invisible_
Jeroen Breen points out that there can be glyphs that appear on the canvas (thus visible) but are scrolled completely out of view (thus, not visible).

In principle—

* the fact that a glyph is not within the viewport should give us an apparent speed benefit;
* when the view is scrolled the glyphs that become visible should be up-to-date.

it looks to me that that best strategy is to—

* update all the glyphs in the specimen, when a parameter or metapolation is changed for them, **but**
  * **priority 1:** update what is inside the viewport first, in reading direction;
  * **priority 2:** update what is outside the viewport, in reading direction.

**local menu**: none

## masters column
Stand-alone masters only; forget about master sequences and adjustment master (sequences). This saves us from a lot of exponential complexity, especially in the design spaces panel. There are also no clones. This means:

* no adjustment master panel at all;
* no interaction nor indications in the sequence column (first one), black bullets are shown always;
* no sequence title item;
* no Clone button.

![](http://mmiworks.net/metapolator/demomasters.png)

Simon and I will come up with a (picture) glimpse of things to come for the adjustment master list.

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
Since there are only stand-alone masters, only simple mixing of masters (e.g. 50% bold, 50% italic) can be performed. Feature stacking (100% bold **and** 100% italic) is the realm of master sequences and cannot be performed. To further the do-more-with-less vibe, the configuration possibilities of the slider group was decimated and a new default behaviour picked: **one-master centric**:

![](http://mmiworks.net/metapolator/centric4.png)

* When 3 or more masters have been dropped on the control design space, one of them is shown on the lefthand side of _all_ sliders; all other masters are set in relation to this one, by the sliders; _this quite suits font designers, who tend to start their thinking from an ‘origin’ (say, the Regular font) and branch out from there—bolder, thinner, wider, etc._
* the popup on the lower-lefthand side contains all dropped masters, in the order they were dropped, and allow any of these to be picked as the ‘lefthand master’; the default is the first master that was dropped on this design space; _in the example above it is possible to set up the sliders Regular-centric (shown), Bold-centric and Italic-centric_; when the lefthand master is changed, the slider setting are recalculated from the current metapolation coefficients;
* all other masters are listed on the righthand side of the sliders, top–to–bottom in the order they were dropped;
* for every additional master dropped on this design space, one additional slider is created; its default setting is 50% and the new metapolation is calculated from that;
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

When a master is removed from a design space (this can also be triggered by the removal of the master from the whole project) the metapolation is recalculated from the remaining slider settings. When it was the lefthand-side master that was removed from the project, then conceptually the following is done:

1. the master that is on the righthand-side of the top slider is promoted to lefthand-side master; sliders are recalculated;
* the doomed master is removed; the metapolation is recalculated;

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
See the parameter specimen above for update highlighting. The recalc rate is different than that for parameter updates but supposed to be faster.

**local menu**: none

## instances column
Stand-alone instances only; This saves the complication of family handling, also in the design spaces. This means:

* no interaction nor indications in the family column (first one), blue diamonds are shown always;
* no multi-selections possible;
* no family title item;
* no Create family of instances button.

![](http://mmiworks.net/metapolator/demoinstances.png)

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

## this space is intentionally left blank

Here is a quick panorama of the working UI demo (**warning**: incorrect in some panel details—_but hey, it was quick_):

![](http://mmiworks.net/metapolator/greenacres.png)

notice the _very_ green areas; they are blank in the working UI demo, there is no app content scheduled for them.

This creates an opportunity for communicating the future of Metapolator, and the fact that we need support to be able to realise that future. Since these are just website frames, the green panels can be updated at any given moment, evolving as the project evolves. No need to get in a funk right now to determine the perfect content.

**note:** especially the large green panel on the right is promising; just where users are getting their results out (ufos), there is a lot of space to communicate.

## the _what’s next_ list
The list below, regularly updated by Peter, in consensus with both Jeroen and Dave, lists the upcoming implementation tasks for the working UI demo:

1. finish generic list interaction _(e.g buttons on the bottom, line and column interaction)_
* based on the above, make master and instance list work _(especially the wiring to other panels)_
* parameter panel _(needs design)_
* font export column, export duration estimate and progress indication _(needs design)_
* finish the local menus _(both mouse click-move-click and mouse down-drag-release modes)_
* … _(updated as we progress)_