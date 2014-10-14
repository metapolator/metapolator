The first part of this page describes what the specimen panels in the Parameters and Design Spaces views have in common. The second part describes the glyph interaction that is integrated with the specimen panel in the Parameters view.

## specimen
Masters, master sequences, adjustment masters, adjustment master sequences, instances, families of instances can appear in a specimen, and any combinations of these six. These six **are known as fonts**, here in this description and in the UI.

here is the general panel (as seen in Design Spaces view):

![](http://mmiworks.net/metapolator/specimen2.png)

from the top:

The **local menu** is empty, _and hence it is not an active popup menu item_ (no triangle displayed either). But wait and see if a function turns up here, that’s why it is in the drawing…

The all-important Print function for specimens is advertised through its own like item.

At the top of the panel itself we find the setup line. From left (R–to–L locales: from right):

* **specimen type**; click link to get a list and pick another;
  * specimens are an extendable system (presumably web-tech based); we can expect every script extension to also supply some specimens.
* font **display size**; click number to type;
  * when the specimen uses hardwired sizes (e.g. a 9, 10, 12 & 14pt body text specimen), then this control is not displayed;
  * the **diamond control** next to the pt-size number is a special one—gleaned from other creative-master interfaces (music)—because the the size range is quite large, 6pt to many hundreds (close to a thousand?) and we do not have all the space in the world for a control;
  * this control is a relative one, it in/decreases; users grab the diamond and pull it away (it is attached ‘by wire’ to its centre point) to make a change in the following fashion _(showing the diamond twice here, for educational purposes)_:<br/>
![](http://mmiworks.net/metapolator/tunebywire.png)<br/>
(for R–to–L locales, right and left have to be flipped); we see there is plenty of bail-out area, to make no change;
  * the amount of in/decrease is simply the sum of the x and y offsets the diamond makes; the update of the number and of the specimen itself is of course continuous; users can concentrate on looking at the specimen itself while scooting the diamond around and then…
  * when users release the diamond, it returns to its resting position and the change is permanent.
* the **filter box** is where users type characters to filter the specimen;
  * when the specimen contains real-life words, the Strict control—a discrete, 3-position slider—is displayed next to it—
    * the setting furthest from the word ‘Strict’ is the least strict one; when a word contains at least one character that is in the filter box, it is displayed;
    * the middle setting is semi-strict; only when a word contains a few characters that are in the filter box, it is displayed; how much a few is depends on the word length and how many characters there are in the filter box;
    * the setting closest to the word ‘Strict’ is, well, strict; only words for which every character matches one in the filter box, are displayed.
  * when the specimen contains mechanically-generated glyph sequences, the Strict control is not displayed and the filter is strict (i.e. the generating is based only on the characters in the filter box);
  * when the filter is strict, the specimen guarantees that of every pair g<sub>1</sub>, g<sub>2</sub> out of the characters in the search box, the sequences g<sub>1</sub>g<sub>2</sub> and g<sub>2</sub>g<sub>1</sub> appears at last once in the specimen (guarantee of completeness);
  * the filter box has a popup menu, with the latest 10 filters this user used, and also convenient pre-defined searches (e.g. ‘All Caps’ for the latin script module).
* finally, the **font mix** settings, shown depending on whether there are multiple fonts to show and/or multiple scripts—if either is not the case then their snippet is not displayed; click link to get a list and pick another.

The multiple fonts/scripts can be mixed by the glyph, word, paragraph or section, depending what is available in the specimen—all have glyphs; real-life specimens tend to also have words and paragraphs; mechanically-generated specimens tend to organise that in sections.

Below a demonstration for font mixing—

by paragraph:

![](http://mmiworks.net/metapolator/mixbypara.png)

by word:

![](http://mmiworks.net/metapolator/mixbyword.png)

by glyph:

![](http://mmiworks.net/metapolator/mixbyglyph.png)

**rule**: the specimen scrolls. Where possible, horizontally all typesetting is fitted to the panel width. The setup line does not scroll with the specimen (fixed position).

### glyph boxes
clicking on a glyph or between two glyphs depends on the glyph boxes; these are rectangles based on the font metrics that can be drawn ‘around’ each glyph. Below we see for the glyphs ‘A’ and ‘V’ how their box overlap is resolved by ‘splitting the difference’ and two non-overlapping boxes are created:

![](http://mmiworks.net/metapolator/glyphboxes.png)

### editing the specimen
When the mouse pointer is hovered for 500ms over the border area of two adjacent glyph boxes, or in the whitespace area after the end of a paragraph, then the mouse cursor is changed to the I-beam (the one used for text editing). The cursor returns to a pointer when a moving threshold is crossed. A click when the pointer is an I-beam sets an edit cursor at this position, and the UI is in text edit mode. At least the following must work:

* insert characters at the cursor;
* delete characters before the cursor;
* paste from clipboard;
* auto-replacement of /-codes with the actual characters; type a code to completion, it gets subbed;
* undo of edits.

Any other super-standard text editing (making/growing/reducing text selections; overwriting these; cut, copy, drag & drop of selections, to name some) would be only wise to implement when it comes ‘for free’ in the form of a library or widget.

A click in whitespace between specimen lines or in the outer margins ends the text edit mode.

### glyph zoom
A double-click on a glyph box zooms and pans the specimen so that this glyph is centred and zoomed so large that it _juuuust_ fits the specimen panel. A second double click in this super-zoomed state (on any glyph for that matter) returns the specimen to the zoom and pan that existed just before the first double-click.

## glyph interaction
This section is specific to the **specimen in the Parameters view**.

### selections
One of the most important jobs that this specimen has to perform is selection of the working context for parameter editing, below master level.<br/>
**rule**: when nothing is selected in the specimen, the (adjustment) masters selected in the (adjustment) masters list(s) are the working context.<br/>
**rule**: (adjustment) masters that are not selected in the (adjustment) masters list(s), but do have their view toggle (in the view column) set to true, cannot be sub-selected in the specimen; they are never the working context for parameter and skeleton work.<br/>
**rule**: although there is multi-selection behaviour throughout the hierarchy, the items in a selection must _all_ be of the same type: either (adjustment) master, script, glyph, segment, line, point, or vector shape.<br/>
**rule**: when there is a selection at glyph, segment, line, point, or vector shape level and the specimen is zoomed in (increase font size), then through panning the specimen tries as long as possible to keep the selected part(s) visible.

Here we see the specimen in the Parameters view, with the glyph select mechanism in action:

![](http://mmiworks.net/metapolator/paraspeciselected.png)

The selection mechanism is based on the icon grid model that is used in file browsers (i.e. not a text selection model). The glyph boxes act as ‘icons’, in a way. For diacritics and other compound glyphs (e.g. via opentype features) the parts that make up the glyph have their own separate box (which may not always be a rectangle, then).

* all of the icon grid model model selection interactions work: click to select, click in whitespace to select none, rubber banding of several boxes to select multiple, shift and cmd/ctrl to grow and reduce selections, pointer mouse cursor (not the text edit one) etc.
* **rule**: the selection highlight is noticeable out of the corner of users’ eyes, but also completely out of the way of the ‘black on white’ of the selected glyphs (because user have to evaluate that while editing these glyphs); above it is done by a 4px blue rule right under the glyph containing box;
* a selection is for that glyph, for that (adjustment) master (see: the italic ‘e’ above); **rule** when a glyph is selected, every instance of that glyph is highlighted in the specimen (see: the italic ‘a’ above).

The selected glyph(s) is now the parameter edit context and this is reflected in the parameters panel.

**rule**: the interaction is now in glyphs mode, and any script, segment, line, point, or vector shape interaction is suppressed.

Alternatively one or more scripts can be selected:

![](http://mmiworks.net/metapolator/paraspeciscript.png)

only relevant scripts (from the master script configurations) are shown. of there is only one script relevant, the line is not shown. clicking each script toggles its selection. to keep the specimen clean, there is no highlighting of the glyphs when selecting a script.

The selected script(s) is now the parameter edit context and this is reflected in the parameters panel.

**rule**: the interaction is now in script mode, and any glyph, segment, line, point, or vector shape interaction is suppressed.

### getting down
Let’s start with part of the specimen:

![](http://mmiworks.net/metapolator/abc.png)

when the font display size is sufficient (say 72pt and up) and the mouse is hovered for 500ms over the **white** of the glyph box, a skeleton and segments view is shown:

![](http://mmiworks.net/metapolator/abcskeleton2.png)

the view disappears when the mouse leaves the glyph box. Users can now click one of the segments to select them _(simulated very crudely here)_:

![](http://mmiworks.net/metapolator/abcsegment.png)

multiple segments, of multiple glyphs, of several (adjustment) masters may be selected—using shift, ctrl/cmd, or rubber-banding.

The selected segment(s) is now the parameter edit context and this is reflected in the parameters panel. Reminder: ‘click in whitespace to select none.’

**rule**: the interaction is now in segment mode, and any script, glyph, line, point, or vector shape interaction is suppressed. Also the skeleton and segments view is now shown instantly (no delay) when mousing over any part of any glyph box.

if on the other hand the font display size is more sufficient (say 144pt and up) and the mouse is hovered for 500ms over the **black** of the glyph box, a skeleton, segments and points view is shown:

![](http://mmiworks.net/metapolator/abcpoints2.png)

instead of having users interact with tiny points, each point is given a stout handle that stays out of the way of the black of the glyph itself. The view disappears after a delay of 1000ms after the mouse leaves black; this gives users time to reach a handle to click it, which selects it.

When no point handles have been selected in this view, the segments can still be selected—this will then make the point handles disappear (i.e. becomes skeleton and segments view).

Multiple points can be selected—using shift, ctrl/cmd, or rubber-banding:

![](http://mmiworks.net/metapolator/abc2points3.png)

also of multiple glyphs, out of several (adjustment) masters:

![](http://mmiworks.net/metapolator/abc4points3.png)

The selected point(s) is now the parameter edit context and this is reflected in the parameters panel. Reminder: ‘click in whitespace to select none.’

**rule**: the interaction is now in point mode, and any script, glyph, segment, line, or vector shape interaction is suppressed. Also the skeleton, segments and points view is now shown instantly (no delay) when mousing over any part of any glyph box.

### direct manipulation
#### single point
When only one point is selected

![](http://mmiworks.net/metapolator/abceditreview2.png)

then a click on the point handle makes a full set of edit handles appear:

![](http://mmiworks.net/metapolator/abcpointedit2.png)

* the point handle sets the position of the point, being connected to it by a ‘rigid stick’; we now see why it is positioned at a certain angle with regard to the real skeleton point: to stay out of the way of the other handles;
* the two red handles are the curve handles and set the direction and tension of the skeleton curve; the handles are coupled for direction and change tensions proportionally—unless cmd/ctrl is pressed which allows a handle to be manipulated individually (cmd/ctrl can be pressed and released repeatedly while manipulating the handle and the feedback updates accordingly; what matters is whether cmd/ctrl is down when the mouse goes up);
* the two triangular handles (shades of a pen nib there) are the pen handles and set the angle and the width of the pen, being connected to it by ‘rigid sticks’; the handles are coupled for angle and change width proportionally—unless cmd/ctrl is pressed which allows a handle to be manipulated individually (cmd/ctrl can be pressed and released repeatedly while manipulating the handle and the feedback updates accordingly; what matters is whether cmd/ctrl is down when the mouse goes up).

To review the edit-in-progress, users can simply take the mouse pointer out of the glyph box:

![](http://mmiworks.net/metapolator/abceditreview2.png)

return the mouse to the glyph box to continue making edits.

**rule**: the interaction is now in point edit mode, and now also any point selection behaviour is suppressed. All focus is on the editing.

A second click on the point handle-in-edit-mode leaves the edit mode.

**rule**: users can scroll to another occurrence in the specimen of the glyph whose point is being edited, and continue the edit work in that context—because it also has a blue handle sticking out.

Apart from the time saving that is offered by using non-itty-bitty handles (say, saving 0,25 second _every time_ a user engages with a handle, for _every user_), one of the big advantages of taking all the handles outside the black of the glyph is that when the weight becomes very thin, there are no repercussions on the handle system:

![](http://mmiworks.net/metapolator/abcthinedit2.png)

#### multiple points
When multiple points are selected (also of several glyphs, of several masters):

![](http://mmiworks.net/metapolator/abc4pointspreedit.png)

then a click on the point handle makes a full set of edit handles appear:

![](http://mmiworks.net/metapolator/abc4pointsedit.png)

**rule**: all edits performed there are propagated to all selected points, in the following way:

* changes to the point position: as x and y offsets (+);
* changes to the curve direction: as offset in degrees (+);
* changes to the curve tension: scale proportionally (×);
* changes to the pen angle: as offset in degrees (+);
* changes to the pen width: scale proportionally (×).

Edits can be continued by clicking on any other selected handle.

### point alignments
_(aka point-nailing, formerly known as pen shifted)_

The purpose of point alignment is to **nail down the spatial relationship** (horizontal or vertical distance, or both) of two points (be them the skeleton point, port or starboard pen-end/on-curve point), no matter how much the coordinates of points in a glyph get transformed (directly, or as knock-on effect of higher parameters, e.g. width), or the pen gets modified (width _and_ angle, again directly, or as knock-on effect of higher parameters, e.g. weight).

When _exactly two_ skeleton points in total are selected, both of the _same glyph_:

![](http://mmiworks.net/metapolator/2points1glyph.png)

then when the mouse is hovered for 500ms in a zone enclosed by the two points and the mid-points of the two handles:

![](http://mmiworks.net/metapolator/hovercorner.png)

then after another 500ms timeout a panel pops up:

![](http://mmiworks.net/metapolator/fixpanel4.png)

on the left and right of the panel we see two schematic representations of the-point-and-pen. Having separate representations allows us to untangle those hairy situations where the two points are (nearly) on top of each other (or bring them together when they are far apart); having schematic representations allows us to deal with those hairy situations where any stroke width is (near) zero. We see that the representations are connected to their point.

In each representation the skeleton point, port or starboard pen-end can be selected to be aligned. The skeleton point is the default. The middle of the panel lists the horizontal and vertical distances between the selected points—these are absolute, never negative. When the point selection is changed, the distances update:

![](http://mmiworks.net/metapolator/fixalign3.png)

we also see that when a distance is zero milliEm, the word ‘align’ is displayed instead. **note** that users can use the two selected skeleton point handles to fine-tune the horizontal and vertical distances in this state, also using the arrow keys.

When point selection and distances are OK, users pick horizontal, vertical or both to be fixed in the middle of the panel. This closes the panel, as does the close box at the top, which makes no change to the alignment setup.

After a fix is picked, the handles permanently show, in selected state, a transparent colouring to indicate a fixed relationship exists for that handle—also a rather modest line to show that relationship:

![](http://mmiworks.net/metapolator/fixed.png)

Changing the nature of, or removing, the fixed relationship follows the same path:

![](http://mmiworks.net/metapolator/unfix3.png)

**note**: to change actual distances of a fixed relationship, users can either edit them in the parameter panel, or remove; reposition point(s); reapply fixed relationship in the specimen.

### optical horizontal lines
_(better known as vertical metrics)_

In general this is about the lines that guide the eyes in reading direction, for any script. The **specific example** I will give here is for **Latin script**. First a very familiar situation:

![](http://mmiworks.net/metapolator/5lines.png)

within the Em square, the ascender, capital, x-height, base and descender lines run. **note** that the five lines divide the Em square into **six zones**. Every glyph has its skeleton points (here shown for the ‘d’) vertically somewhere in these zones (that a point can be exactly on a line does not change this story). When we look up close we see that none of the skeleton points are on a line here:

![](http://mmiworks.net/metapolator/notonlines.png)

For metapolator we (Simon and Peter) are proposing the following system for how the glyphs react to change in the vertical position of optical horizontal lines:

**rule**: when an optical horizontal line is moved up, then the zone above it gets compressed and the one below it stretched, and all skeleton points in these 2 zones move proportionately. Conversely when an optical horizontal line is moved down, then the zone above it gets stretched and the one below it compressed, again all skeleton points in these 2 zones move proportionately. Here an example:

![](http://mmiworks.net/metapolator/move20up.png)

the proportional distance to the non-moving line is used to calculate the movement of the skeleton points.

This system is actually **really similar** to the way that the width parameters changes x-coordinates of skeleton points (and did that not include a re-calculation of pen angles?).

You may have noticed two things are missing from this story (we consider this beneficial):

1. **tagging** is not necessary to make this work; all that needs to be known is the position of the skeleton points and the location of the horizontal lines, the latter which can be read out of an ufo (or initially set by users if need be);
* **overshoot** has become implicit, instead of an explicit concept; it is there in the relationship of skeleton point positions and pen widths.

#### getting fixed
To create exceptons to the proportionate behaviour, users can set for points to have **fixed** vertical offset, either to the line above or the one below.

#### refinement
After a discussion with Simon, Wei and Nicolas, Peter adds the following—

**rule**: lines are mapped to classes of glyphs. For instance in Latin, the cap height line only pertains to capitals, ascender, descender and x-height only to lowercase. This tagging will be provided by Metapolator (it was already in previous versions). Means to customise it are coming soon…

**rule**: if the pen blade of a point crosses an optical horizontal line (i.e. the point of the pen is on one side of the line and the edge of its stroke on the other side of it), then the point is attached at a fixed vertical offset to that line. This preserves overshoot, which that crossing _is_.

**note**: zones are a concept in ufo and could match the meaning of zones we use here.

### width, weight and spacing
Character width, body width, spacing, sidebearings—front and back, there are quite a few overlapping
horizontal metrics in type design. On top of that traditionally changing the weight of the glyph interacts with these metrics.

Interestingly, one does not need so many parameters to _technically_ fully describe this system: on top of the point coordinates, one needs an advance for each glyph, and a number for (let’s call it) pen weight to drive the rendering. The conclusion is that it is the UI, that aims to offer directness and flexibility to users, drives the choice of parameters.

The other day we (Simon and Peter) discussed all this and came to a system that offers this directness and flexibility, without ending up with parameter-bloat. We observed these basic principles:

1. imported ufos come with spacing set; this can be good or so-so, but we assume that it is a workable spacing for type designers;
* imported ufos (quite likely) come with kerning tables; these can be good or so-so, but we assume that it is a workable kerning for type designers;
* if one measures the spacing from the first and last skeleton point of the glyph—instead from the first and last black—then a wholesale stroke weight cis unlikely to trigger a need for wholesale spacing adjustment (the stroke grows/shrinks equally into the inner-glyph space and outwards into the sidebearings).

After looking at a lot of possible metrics combinations, we picked the following glyph-level parameters:

![](http://mmiworks.net/metapolator/width+space.png)

* **width**: this is b–c above; this is a scalar (default: 1.0) that multiplies the actual x-coordinates of the points in the glyph; **convention**: the front-most (in reading direction) point of the glyph has x-coordinate = zero;<br/>
_this allows users to express at glyph, or any level above (e.g. script, master or project level), ‘width × 1.1’ and the skeleton of all glyphs concerned is extended by 10%_
* **spacing**: this is directly a–b above (and indirectly c–d—see below); expressed in units, this is in general the spacing of the glyph, by default calculated for each glyph individually out of the imported ufo;<br/>
_this allows users to express at glyph, or any level above (e.g. script, master or project level), ‘spacing × 0.9’, or ‘spacing + -12 units’, and the spacing of all glyphs concerned, front and back sidebearings, is reduced_
  * **note**: this number can be negative; this means directly that the front sidebearing is negative (at the back? see below).
* **back/front** this is a scalar that sets the ratio between c–d and a–b above, e.g. spacing = 74 units and back/front* = 0.94m then back sidebearing is 70 units; by default calculated for each glyph individually out of the imported ufo.
  * **note**: this number can be negative; this means that the back sidebearing is opposite in sign to the front one; example: spacing = -55 units and back/front = -2, then the front sidebearing is -55 and the back sidebearing is 110.

#### preserving kerning
The two sidebearings of a glyph consists of two parts: the general spacing of the font, plus the generalised shape (of-this-side-of-the-glyph) compensator—in relation to ‘o’ & ‘n‘, or ‘O’ & ‘N’, for Latin. Kerning is the glyph-pair optimiser of the shape compensator.

Since wholesale changes of spacing imply changing the general spacing of the font—better done by offset than by multiplying—the kerning can be left untouched for these (since kerning does not relate to it).

#### pen weight
The point parameter (pen) width can be renamed to **weight**, while maintaining the port/starboard parameter (i.e. left/right ~~width~~ weight ratio, looking in the direction in which the pen moves).<br/>
_this allows users to express at point, or any level above (e.g. segment, glyph, or master level), ‘weight × 1.1’, or ‘weight + 2 units’, and the stroke weight of all points concerned is increased._

## an interim parameter overview
_work in progress_

**glyph** parameters (can be set at glyph, script, master and project level)

* height _(scales all vertical metrics)_
* width _(scales the skeleton horizontally)_
* slant
* spacing _(= front sidebearing)_
* back/front _(back sidebearing = back/front × spacing)_
* [vertical metrics](https://github.com/metapolator/metapolator/wiki/specimen,-and-glyph-interaction#optical-horizontal-lines), depending on script and glyph; for instance for Latin, lowercase:
  * x-height
  * ascender
  * descender
* point alignments _(aka point-nailing, fka penshifted)_; [see here](https://github.com/metapolator/metapolator/wiki/specimen,-and-glyph-interaction#point-alignments)

**point** parameters (can be set at point, segment, glyph, script, master and project level)

* skeleton
  * x
  * y
  * direction in
  * direction out
  * tension in
  * tension out
  * restart curve _(completely decouple incoming and outgoing curves; the & in metafont)_
* pen
  * weight
  * port/starboard _(i.e. left/right weight ratio, looking in the direction in which the pen moves)_
  * angle
  * kink _(port-starboard angle difference)_

### glyph range
A glyph range is treated as _nothing but a specimen_ and it is available as such in the Parameters view:

![](http://mmiworks.net/metapolator/glyphrange.png)

We see that at the bottom of the panel there is now a **glyph management bar**. The two encodings are click-to-edit. By drag-and-drop the glyph order can be rearranged, which is ultimately the order of exported fonts.

The **local menu** now contains these items:

* Add Glyph…
* Duplicate Glyph
* -- \<separator\> --
* Delete Glyph…