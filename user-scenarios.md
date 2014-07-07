User scenarios show essential use, in logical, worthwhile and valuable steps from users’ point of view. There is no need for completeness, just a compact set of scenarios that lead through most of the ‘field’ of use. Some of these scenarios have been tuned the ‘Metapolator’ way. Certain steps that are needed today—because font tools are broken—have been omitted (fix the tools, not users’ activity).

## scenario 1
_Easy beginnings: make subtle changes to an existing font to adapt it to domain of use._

1. Open the font that needs adapting
* for the whole font, or one or more glyphs:
 2.  adjust one, or two, or three typographical aspects (parameters—e.g. weight, or spacing—or skeleton, or opentype features) of the font
 *  evaluate the impact of the adjustments, from different perspectives (e.g. one glyph, some glyphs, whole font, several fonts)
    3. this on-screen and/or in hardcopy (printed)
    * this ranges from as-fast-as-possible loops, to long, contemplative periods (days or even longer)
 * iterate until the font looks and feels to meet the goals in the context of use
* in between: save this adaptation work—for safety sake and to be able to continue the work later
* export font for use in context
* throughout the design lifecycle of the context (the actual work) make further iterations (repeat this scenario, starting from any point in the workflow)
* at the point where font adjustment seems solid: adjust kerning where needed
* finally: hinting (when needed).

### scenario 1b
_Typographer applies radical graphical treatments to an existing font for a design._

Same as scenario 1, but with the following differences:
* apart from typographical adjustments, there are also graphical/geometrical adjustments
* adjustments may not be subtle, nor within the realm of ‘conventional’ fonts
* the intention is still to make adjustments for the ‘whole’ font in one go, not on a glyph-by-glyph basis.

## scenario 2
_Font designer creates a new font through exploration of two compatible masters (i.e. in script, glyph shapes—on a typographical, non-tech level)._

1. Open font for master 1
* either:
 * open font for master 2, the other ‘extreme’ of this exploration
* or
 2. duplicate master 1 -> 2
 * for the whole font or one or more glyphs:
    * adjust any typographical aspects (parameters, or skeleton) of master 2 (see scenario 1)
 * iterate until master 2 looks and feels ‘right’ as the other ‘extreme’ of this exploration
* optional: label the masters to note their intent (and to make it easier to revisit this work, beyond tomorrow)
* explore the multitude of possible instances in-between the two masters
 2. evaluate from different perspectives (e.g. one glyph, some glyphs, whole font, c.f. master 1 + 2, several fonts)
    * this on-screen and/or in hardcopy (printed)
 * keep interesting instances ‘pinned-down’, to compare with while further exploring
* in between: save this exploration work—for safety sake and to be able to continue the work later
* adjust typographical aspects of one or both masters (see above), to reposition the exploration; repeat exploration (see above)
* adjust kerning of an instance where needed
* export the current or a ‘pinned-down’ exploration instance as a font
* perform review and approval of the font (this designer, maybe also by externals)
 * rework the font as needed, by either
    3. touching up the font in external program
    * revisiting the exploration, adjust masters and exploration (see above)
      * optionally make the current font one of the masters (or a third master)
* finally: hinting (when needed)
* when the font is ready: release it to the outside world
* months or years later: repeat this scenario (starting from any point in the workflow) to create an updated version of this font.

## scenario 3
_Create a font from sketch (a scan, or graphics made outside of font tools)._

1. Import the image of a number of characters
 2. identify each glyph on the image and match to a character (code) from a script
 * perform auto-trace
 * evaluate the match of the image and the generated glyphs
 * correct both skeletons and typographical parameters, until best match is achieved
 * set side-bearings for each glyph
* auto-generate complete glyph set for the script(s)
* use default opentype features for script(s), or override by custom definitions
* in between: save this design work—for safety sake and to be able to continue the work later
* evaluate glyph set, from different perspectives (e.g. one glyph, some glyphs, whole font, several fonts)
 2. this on-screen and/or in hardcopy (printed)
 * this ranges from as-fast-as-possible loops, to long contemplative periods (days or even longer)
 * make corrections to the skeleton and side-bearings of the glyph set and individual glyphs
* iterate until the glyph set looks and feels ‘together’, like a font should
* continue with scenario 1, 2, or even 1b to finish the font.

## scenario 4
_The grind: flesh out 3+ masters to a family/multiverse._

1. Load 3+ masters or prepare them (see scenarios 1, 1b, 2 and 3 for various ways of doing this)
* set up the design space with the masters
* eventually create a new master out of the loaded ones
 2. either:
    3. explore the multitude of possible instances in-between the masters
    * promote the instance to a new master
 * or copy one master, _straight_
 * adjust any typographical aspects (parameters, or skeleton) of this new master (see scenario 1)
 * iterate until this new master looks and feels ‘right’ as a new ‘extreme’ of the design space
* build the collection (i.e. the family or multiverse)
 2. combine:
    3. place instances one by one in the design space
    * span a series of instance in the design space
 * label up instances
 * evaluate the instances, from different perspectives (e.g. one glyph, some glyphs, whole font, several fonts), same for the collection (does every instance work with every other instance)
    3. this on-screen and/or in hardcopy (printed)
    * this ranges from as-fast-as-possible loops, to long contemplative periods (days or even longer)
    * make corrections by adjusting the placement of instances
 * iterate the until collection looks and feels ‘together’, like a collection should
* in between: save this collection work—for safety sake and to be able to continue the work later
* adjust kerning of each instance where needed
* select which instances in the collection shall be exported as fonts, and in how many families
* export in one go
* perform review and approval of the font families, (this designer, maybe also of externals)
 * rework the font as needed, by either
    3. touching up the families in external program
    * revising the collection, adjusting instance placement (see above)
      * optionally create new masters out of instances (see above)
* finally: hinting (when needed)
* when the families are ready: release them to the outside world
* months or years later: repeat this scenario (starting from any point in the workflow) to create an updated version of this collection.

## scenario 5
_Extend: add script (i.e. a writing system) support._
* Packing list for developers:
 * metafont algorithm containing typographic knowledge of this script; implicit definition of typographical parameters
 * exception definitions of so-called ‘universal’ typographical parameters that really should not be applied to this script
 * unicode range affected by this script
 * default opentype features definition
 * generic skeleton set for all glyphs in this script (used for auto-trace and glyph set generation in scenario 3)
 * side bearings defaults for these glyphs (only where this is required to make the script ‘work’ for its readers).

### scenario 5b
_Extend: add a custom algorithm._