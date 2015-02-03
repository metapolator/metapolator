This page contains the deltas for the working UI demo of February–March 2015, in comparison to the contemporary overall interaction design. The working UI demo is meant to wrap up the current project phase, and to enable the next phase.

Naturally this will stick closely to what has been achieved up to now and what will be done for minipolator. Some of the choices that have to be made will hurt, but it will enable us to make something that can be useful to font designers.

In general the working UI demo must be visual-designed, really communicating that people with visual design acumen work on this, but it should not look finished. The message should be in every way, also visually: this is just a start.

This page is organised by UI section and refined just-in-time.

## project + view control
If there is a back-end for metapolator project files, then we can do some basic Open and Save; if not we bite the bullet and work with no projects: one-shot editing. view control is basically done; a few mins of fine tuning.

## parameters
Stick to minipolator, i.e. offer only weight and width controls. Simon and I can make a nice interim design for this panel, something very simple with a hint of things to come.

## specimen + glyph editor
forget about any direct-manipulation (i.e. with the mouse) parameter editing. our pain is changing glyphs in real-time, maybe we can show only 2, 3, or 5 glyphs that get their weight or width changed. these can still be mixed with other glyphs that are static (because they belong to another master, or are not part of the selection). the filter of the specimen needs to be re-jigged to show only those few chars that we can handle. glyph selections in the specimen must work.

## masters column
stand-alone masters only; forget about master sequences and adjustment master (sequences). this saves us from a lot of exponential complexity, especially in the design spaces. Simon and I will come up with a (picture) glimpse of things to come for the adjustment master list. it should be possible in this working UI demo to load one ufo, and create a total of 5 masters out of it (width and height variations).

## design spaces
here you can now see how much work I saved us in the masters column. the control design space can be rigged up with simple sliders and triangles (+Jeroen Breen demoed them). maybe we set a limit of max 3 masters. maybe we drop, for now, free configuration of the sliders. optional: explore spaces (we look pretty close to having that working too).

## specimen (metapolation)
even more pain with doing this in real-time. same, or even tougher, limits (re: parameter specimen) on how few glyphs we can show changing (surrounded by static masters and instances, again).

## instances column
stand-alone instances only; this saves the complication of family handling, also in the design spaces. working with 8 instances should not be a problem.

## font export
forget about opentype mapping, unless there is a no-brainer default. I will design something super-simple that warns how long a font export will take (estimate): “this export will take approximately 3 hours, 43 minutes.” ah, and a progress bar while it is exporting.

## metadata
completely forgetaboutit. Simon and I will come up with a (picture) glimpse of things to come for metadata.

## et cetera
an important but invisible category of interaction that we can forget about for the working UI demo is copy & paste, and undo. that is a tough portion of development work.﻿