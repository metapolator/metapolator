This page contains the design deltas for the working UI demo of February–March 2015, as compared to the contemporary overall interaction design. The working UI demo is meant to wrap up the current project phase, and to enable the next phase.

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
Stick to minipolator, i.e. offer only weight and width controls. These work on (multiple) master and (multiple) glyph level. We can make a nice interim design for this panel, something very simple with a hint of things to come.

**local menu**: none

## specimen + glyph editor panel
Forget about any direct-manipulation (i.e. with the mouse) parameter editing. What is performed in the specimen is (multiple) selections of glyphs, to individually adjust these (whole glyphs). There is no glyph management (e.g. Add or Delete glyph from master).

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
Forget about opentype mapping, unless there is a no-brainer default. I will design something super-simple that warns how long a font export will take (estimate): “this export will take approximately 3 hours, 43 minutes.” ah, and a progress bar while it is exporting.

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