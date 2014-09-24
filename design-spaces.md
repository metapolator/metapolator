## getting started
The design spaces panel provides a tabbed interface that looks by default like this:

![](http://mmiworks.net/metapolator/startspace.png)

from the top:

The **local menu** contains these items:

* New
* Duplicate
* -- <separator> --
* Delete…

**notes**:

* Duplicate not only duplicates the current design space tab, it also duplicates its instances in the instances list;
* Delete ot only removes the current design space tab, it also removes its instances from the instances list.

The **tabs** can be renamed by double clicking on their label, and resorted. Always at the right (for L–to–R locales) there is a ‘New tab’ tab. The tabs do not have close boxes ([X]), because it a way to heavy action (lose all instances that live on this tab) to be causally offered. Tabs will need an overflow mechanism for when there are too many to show at once. We expect quite a few tabs because they are for serious projects a way to break down complexity for users.

The space is not configured, so its background is still ‘chrome’ and it prompts a **choice of space**:

![](http://mmiworks.net/metapolator/spacechoice.png)

Exploration is not compatible with Control. Exploration is a flat-earth, limited view of metapolation reality, Control can set and show any possible combination. Thus **a choice must be made**, by clicking either on the big link or the illustration. **shortcut**: drop one or more master (sequences) on the big link or illustration to make the choice _and_ initialise the space with the dropped items.

Once the choice is made the tab transitions (suggestion: dissolve) to the empty state for that type:

![](http://mmiworks.net/metapolator/explorempty.png)

We see the background is now of the content type and that an icon representing the type of design space has been inserted in the tab. This helps identifying multiple tabs:

![](http://mmiworks.net/metapolator/tabicons2.png)

some **general rules** for all spaces:

* every instance that is created—whether part of a string or not—in the instances list immediately appears on the current design space and is part (exclusively) of that space;
* masters, master sequences, adjustment masters and adjustment master sequences are added to a design space by dragging them from their list and dropping them on the design spaces panel; this can be done for multiple selections of those items also;
* masters, master sequences can appear on multiple design spaces; a master that is part of a sequence can appear on its own in any design space; adjustment masters and adjustment master sequences can appear only on one design space, once;
* masters, master sequences, adjustment masters and adjustment master sequences are removed from a design space by dragging them out of the design spaces panel and dropping them back over the masters column;
* adjustment masters (sequences) cannot be dropped on a design space when it does not contain master or master sequence;
* the size of the design spaces area is quite variable, in width (window resize) and in height (‘let’s have a good look at that specimen’). Therefore design spaces scroll where necessary;
* reconfiguring a design space, by adding or deleting master & co, means change to all instances, because now more/less elements go into their mix.

## exploration space
The action starts when masters get drag ’n’ dropped on the exploration space. Adding one master is not _that_ interesting:

![](http://mmiworks.net/metapolator/explore1master.png)

The single master dominates the whole space. **rule**: master can be placed anywhere in the space.

It is identified by the first character of its name in the master list (if that was the default ‘Master 1’ then it is called ‘M1’ here). _We do not want a visual space full of writing._ Clicking (and/or holding) the master in the space identifies it in the master list by highlighting it exclusively (for the duration that the mouse is down).

What is interesting, **rule**: when the first master (sequence) is added to the space, also a first instance is created for the space in the instances list, selected there and shown by means of the cursor.

The plot thickens when a second master is dropped:

![](http://mmiworks.net/metapolator/explore2masters.png)

Since at the position where a master is located it is the undisputed ruler of the design space (100% defines the metapolation result) all other masters must have zero strength at that point. Ergo: masters limit the reach of other masters.

**rule**: when the reach of a master is (effectively) limited by _one_ other master, its reach (aka field) is circular.<br/>
**rule**: the fields of the masters ramp down from 100% strength at the centre, to 0% at its edge.<br/>
**rule**: in the mix zone (here: between C and F) the metapolation mix is simply the ratio of the field strengths.<br/>
**rule**: when a master is grabbed with the mouse and dragged around, the fields of it and and other masters are continuously updated until the master is released in its new position.<br/>
**rule**: when the master configuration of a space is changed, the metapolation mix of the instances does not change and they ‘tag along’ in space the best they can.

And then we drop a third master and their representation matures:

![](http://mmiworks.net/metapolator/explore3masters.png)

**rule**: when multiple masters limit the field of a master, its field is an ellipse, which has its long axis pointing exactly at the _second-nearest_ neighbour, with the long axis length set to be the exact distance to that neighbour. the short axis is set so that the ellipse perimeter touches exactly the position of the _nearest_ neighbour.

### (strings of) instances

The (strings of) instances that live in this design space and are not the currently selected ones are shown in symbols that match the ones in the instances list:

![](http://mmiworks.net/metapolator/exploreinstances.png)

The currently selected instance is the one being moved about (i.e. edited) and represented by the cursor.

### master sequences
Dropping one master sequence on an empty exploration space is not that exiting either:

![](http://mmiworks.net/metapolator/explore1sequence.png)

Again the space is dominated by a single object, although now sliding the cursor _along_ the sequence will map to the all possible intermediate stages between the masters that make up the sequence. **rule**: a sequence is represented by a straight vector, which can have any angle and length. The dot and arrow match the direction in the masters list and are the two handles to manipulate it in the space.

It is identified by the first character of its name in the master list (if that was the default ‘Sequence 1’ then it is called ‘S1’ here). Clicking (and/or holding) the sequence dot in the space identifies it in the master list by highlighting it exclusively (for the duration that the mouse is down).

It takes only one master to limit the extend of a sequence:

![](http://mmiworks.net/metapolator/explore1sequence+1.png)

We see also how the sequence limits the master; its line acts like a wall (indeed, one sequence limits another, when placed together). **rule**: the field of a master sequence ramps down from 100% strength on the line, to 0% at its edge.

When we drop some more masters, the sequence has more to interact with:

![](http://mmiworks.net/metapolator/explore1sequence+3.png)

We see how master H is effectively blocked by the sequence from interacting with the other two masters. Both the sequence and master C have expanded in area because there are more masters to interact with.

The field of a sequence is built out of 2 rectangles and 4 quarter-ellipse segments:

![](http://mmiworks.net/metapolator/sausageparts.png)

**rule**: each part looks outward for other objects (e.g.masters) to limit it; it complied with these **and** the requirement to fit seamlessly with its 2 neighbour parts.<br/>
**rule**: if there are conflicting requirements, the part complies with the one that results in the smallest size.<br/>
**rule**: if a quarter-ellipse segment encounters only one requirement, it becomes a quarter circle and passes on the requirement to the next, unconstrained part(s).

### adjustment masters
Dropping an adjustment master has an interesting effect:

![](http://mmiworks.net/metapolator/exploreadjust.png)

Because an adjustment master is a _soft adjustment_ to the design space, and not a _hard definition_ like a master is, it **does not limit** the fields of other master (sequences). It is however limited by other master (sequences), as we can see above. The symbol for an adjustment master is an up-pointing triangle, derived from the delta (Δ) symbol. Apart from this an adjustment master _functions like a normal master._

### adjustment master sequences
Adjustment master sequences look rather straight-edge, compared to master sequences:

![](http://mmiworks.net/metapolator/exploreadjustsequence.png)

This is because at the head and tail end the sequence **starts hard**, instead of fading in from edge, allowing designers to place step-like changes in the design space. Perpendicular to its line the field of a adjustment master sequence _does_ ramp down from 100% strength on the line, to 0% at its edge.

Just like adjustment masters, adjustment master sequences do not limit the fields of other master (sequences). The field of an adjustment master sequence radiates out to both sides (independently) until it is stopped by a master (sequence).

### colors
The colours I use in my examples are 100% saturated, 100% brightness colours at 20% opacity. The hue is generated by dividing the 360° hue coordinate by 20 (no repeats for the first 20 objects): 18° hue increments.

Now start at hue = 0° for the first object and increment 72° for each next one, until back at 0°;<br/>
now start at hue = 36° for the next object and increment 72 ° for each next one, until back at 36°;<br/>
now start at hue = 18° for the next object and increment 72 ° for each next one, until back at 18°;<br/>
now start at hue = 54° for the next object and increment 72 ° for each next one, until back at 54°;<br/>
now start again from the top.

_yes, this has been tested for 8 types of color-blindness, with Sim Daltonism.app—the point is whether one can see the area delimeters._

## control space
Also here the action starts when masters get drag ’n’ dropped on the control space. Adding one master is not _that_ interesting:

![](http://mmiworks.net/metapolator/control1master.png)

The single master dominates the whole space. **rule**: layout of elements in this space is fully automatic, based on the order things are added and when in doubt, the order they appear in the master and adjustment masters lists.

What is interesting, **rule**: when the first master (sequence) is added to the space, also a first instance is created for the space in the instances list, selected there and shown by means of the cursor.

The plot thickens when a second master is dropped:

![](http://mmiworks.net/metapolator/control2masters.png)

Now instances can be set up as a mix between the two masters. The slider’s width is 200px and everything is designed to be compact, because this UI has to scale for many masters. The numerical value of the setting goes from 0 to 100; click to edit. Also at the bottom-right we see the Extrapolation setting has appeared, more about that later.

And then we drop a third master and their representation matures:

![](http://mmiworks.net/metapolator/control3masters.png)

A second slider appears; for every master dropped here we get an extra slider. triangles next to the labels show that we can pop up a list to configure the sliders, together with the All item on the lower-left. _write up of configuration rules coming soon (an edit of [this](https://github.com/metapolator/metapolator/wiki/elements-of-design#metapolation-sliders), really)._

When the number of (‘unsequenced’) masters is three, the Triangle switch is shown (as is above). This switches to the following mode:

![](http://mmiworks.net/metapolator/controltriangle.png)

We see the three masters arranged at the tips of an equal-sided triangle. The percentage of each master in the mix goes from 0 to 100 (and the three always add up to 100); click to edit.

It is a real shame that the triangle representation only works this beautifully and ‘zen’ for three masters, for more masters things just get, ehm, tangled. So it is only available for 3 masters; add or delete a master and it is back to straight sliders.

### (strings of) instances
The (strings of) instances that live in this design space and are not the currently selected ones are shown in symbols that match the ones in the instances list:

![](http://mmiworks.net/metapolator/controlinstances.png)

triangle form:

![](http://mmiworks.net/metapolator/controltriangleinstances.png)

The currently selected instance is the one being edited and represented by the cursor.

### master sequences
Dropping one master sequence on an empty control space is already quite useful:

![](http://mmiworks.net/metapolator/control1sequence.png)

Plenty of instances can be pulled from this alone. The slider length (200px) is divided down equally for the number of master in the sequence (here: 4). The master sequence name is shown top-left, with the numerical value, representing the slider position after it; it goes from 0 to 100; click to edit.

When a second master sequence is added, two different cases can occur. Either the two sequences have one master in common (e.g. both contain a master called ‘Body’, which are exactly the same—most easily done my cloning a master and putting the results in both sequences). Then the two sequences are said **to cross**.

Or the two sequences have no master in common and are said to **not cross**. This because it will be nigh impossible to find one point on each sequence where the ~50.000 datapoints that (easily) make up a font are _quite_ (say, within 1%) the same.

#### crossing sequences
The more compact representation of crossing sequences is in slider form:

![](http://mmiworks.net/metapolator/control2sequences.png)

The ‘crossing’ master is Regular and this is shown by the graceful connecting line; all metapolation is calculated as deltas with reference to this crossing master, allowing the stacking of design features (e.g. fully Bold _and_ fully Extended)—an implicit form of extrapolation _(psst, don’t tell the users)_.

It is easy to see how this system deals with ever more complex setups (without breaking a sweat):

![](http://mmiworks.net/metapolator/control3sequences.png)

No matter where the crossing master master turns up in a sequence, it can be connected.

We also see the Cross switch. This switches to show as many crossing x/y graphs as possible. Here the two-sequence version:

![](http://mmiworks.net/metapolator/control2cross2.png)

The second sequence has been plotted vertically (200px height) and the two axes cross exactly where the crossing master is on both—also when this is the first or last master of a sequence.

It takes two axes to make an x/y graph, so when there are an odd number of crossing master sequences, one has to be a wallflower:

![](http://mmiworks.net/metapolator/control3cross2.png)

Nonetheless we can hook it up, using the common master. **rule**: with multiple x/y graphs, also a graceful line is drawn to connect the axes-crossings of the graphs.

Normally, **masters, crossing sequences and non-crossing sequences live in different sections** and we will see later how they get mixed at the end. A cool **exception** is that when a master is dropped _directly_ on a crossing sequences area, it gets hooked up as a delta to the common master:

![](http://mmiworks.net/metapolator/control2sequences+2.png)

Here two masters—Italics and one called ‘Alt 2’—have been dropped on the the two-sequence section. Now whatever Italics and Alt 2 have to offer, compared to Regular, can be added to the instances. In cross representation: same deal. We see that the master sliders look different than sequence sliders, and that is a good thing.

#### non-crossing sequences
When two sequences have no common master, we can still mix between their results:

![](http://mmiworks.net/metapolator/control2nocross.png)

We see a diagonal ‘cross-fader’ hooked up between Weight and Vibe, and creates a mix between their outcomes. Numerical value and instance indicators are on the side. As more non-crossers are added, the chain grows:

![](http://mmiworks.net/metapolator/control3nocross.png)

### adjustment masters
An adjustment master has to be placed like an instance in the design space, on all controls/dimensions, to control both _where_ it works and what its underlying master mix is (aka 99% of its appearance—on top of which its adjustments are applied.

Shown here is the placement of **one** adjustment master, on a **fictive** potpourri of controls:

![](http://mmiworks.net/metapolator/controladjust.png)

The symbol for an adjustment master is an up-pointing triangle, derived from the delta (Δ) symbol. Clicking (and/or holding) the triangle in the space identifies it in the adjustment master list by highlighting it exclusively (for the duration that the mouse is down).

In effect an adjustment master sub-divides the dimension(s) on which it is placed. For instance above, chilly–earthy becomes chilly–adjustment–earthy and the Bold-Narrow-Italic triangle gets subdivided in adjustment-Narrow-Italic, Bold-adjustment-Italic and Bold-Narrow-adjustment.
  
### adjustment master sequences
An adjustment master sequence introduces a hard-edged line of change into the design space. Shown here is the placement of **one** adjustment master sequence, again on a **fictive** potpourri of controls:

![](http://mmiworks.net/metapolator/controladjustsequence.png)

The triangle is the start of the sequence and the end-of-the-line symbol… the end (as seen in the adjustment master list).

### extrapolation
Switching on extrapolation:

![](http://mmiworks.net/metapolator/extraon.png)

adds extra extensions to the controls. The master slider receives 50% extra (in pixels) on both sides:

![](http://mmiworks.net/metapolator/extramasters.png)

The extrapolation range is compressed for layout reasons; in metapolation terms users get 100% extra (e.g. above, from 2 × Alt-1 - Alt-2 to 2 × Alt-2 - Alt-1). **rule**: the extrapolation area is always shown in stippled lines (ticks are solid). The numerical values now go from -100 to 200. **rule**: we avoid labelling the extrapolation areas, avoiding faux-pas like ‘extra-Regular.’ In a sense, labelling is extrapolated by users from the regular labelling.

**rule**: when instances or adjustment masters (sequences) have been placed on an extrapolation range, extrapolation mode cannot be switched off—all of the current state needs to be shown.

Triangle extrapolation is again a work of beauty:

![](http://mmiworks.net/metapolator/extratriangle.png)

Three full-size extra triangles are added (no compression here). The numerical values now go from -100 to 100.

Sequences are extended on both sides by one subdivision:

![](http://mmiworks.net/metapolator/extrasequences.png)

because that is what effectively happens: an extra subdivision is generated out of the outer interpolation division. There is no compression. Thus above, Weight gets on the left a subdivision that goes out to 2 × Thin - Light and on the right one that goes out to 2 × Bold - Regular. Width gets on the left a subdivision that goes out to 2 × Condensed - Regular and on the right one that goes out to 2 × Extended - Regular.

The numerical values reflect the amount that the sequence got extended; Thus above, Weight now goes from -33 to 133 and Width from -50 to 150.

The crossed master sequence version is analogous to the slider version:

![](http://mmiworks.net/metapolator/extracross.png)

### putting it all together