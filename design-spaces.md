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

## exploration space
Action start when masters get added to the exploration space. Adding one master is not _that_ interesting:

![](http://mmiworks.net/metapolator/explore1master.png)

The single master dominates the whole space. **rule**: master can be placed anywhere in the space.

It is identified by the first character of its name in the master list (if that was the default ‘Master 1’ then it is called ‘M1’ here). _We do not want a visual space full of writing._ Clicking (and/or holding) the master in the space identifies it in the master list by highlighting it exclusively (for the duration that the mouse is down).

What is interesting, **rule**: when the first master (sequence) is added to the space, also a first instance is created for the space in the instances list, selected there and shown by means of the cursor.

The plot thickens when a second master is added:

![](http://mmiworks.net/metapolator/explore2masters.png)

Since at the position where a master is located it is the undisputed ruler of the design space (100% defines the metapolation result) all other masters must have zero strength at that point. Ergo: masters limit the reach of other masters.

**rule**: when the reach of a master is (effectively) limited by _one_ other master, its reach (aka field) is circular.<br/>
**rule**: the fields of the masters ramp down from 100% strength at the centre, to 0% at its edge.<br/>
**rule**: in the mix zone (here: between C and F) the metapolation mix is simply the ratio of the field strengths.<br/>
**rule**: when a master is grabbed with the mouse and dragged around, the fields of it and and other masters are continuously updated until the master is released in its new position.<br/>
**rule**: when the master configuration of a space is changed, the metapolation mix of the instances does not change and they ‘tag along’ in space the best they can.

And then we add a third master and their representation matures:

![](http://mmiworks.net/metapolator/explore3masters.png)

**rule**: when multiple masters limit the field of a master, its field is an ellipse, which has its long axis pointing exactly at the _second-nearest_ neighbour, with the long axis length set to be the exact distance to that neighbour. the short axis is set so that the ellipse perimeter touches exactly the position of the _nearest_ neighbour.

### (strings of) instances

The (strings of) instances that live in this design space and are not the currently selected ones are shown in symbols that match the ones in the instances list:

![](http://mmiworks.net/metapolator/exploreinstances.png)

The currently selected instance is the one being moved about (i.e. edited) and represented by the cursor.

### master sequences
Adding one master sequence to an empty exploration space is not that exiting either:

![](http://mmiworks.net/metapolator/explore1sequence.png)

Again the space is dominated by a single object, although now sliding the cursor _along_ the sequence will map to the all possible intermediate stages between the masters that make up the sequence. **rule**: a sequence is represented by a straight vector, which can have any angle and length. The dot and arrow match the direction in the masters list and are the two handles to manipulate it in the space.

It is identified by the first character of its name in the master list (if that was the default ‘Sequence 1’ then it is called ‘S1’ here). Clicking (and/or holding) the sequence dot in the space identifies it in the master list by highlighting it exclusively (for the duration that the mouse is down).

It takes only one master to limit the extend of a sequence:

![](http://mmiworks.net/metapolator/explore1sequence+1.png)

We see also how the sequence limits the master; its line acts like a wall (indeed, one sequence limits another, when placed together). **rule**: the field of a master sequence ramps down from 100% strength on the line, to 0% at its edge.

When we put some more masters, the sequence has more to interact with:

![](http://mmiworks.net/metapolator/explore1sequence+3.png)

We see how master H is effectively blocked by the sequence from interacting with the other two masters. Both the sequence and master C have expanded in area because there are more masters to interact with.

The field of a sequence is built out of 2 rectangles and 4 quarter-ellipse segments:

![](http://mmiworks.net/metapolator/sausageparts.png)

**rule**: each part looks outward for other objects (e.g.masters) to limit it; it complied with these **and** the requirement to fit seamlessly with its 2 neighbour parts.<br/>
**rule**: if there are conflicting requirements, the part complies with the one that results in the smallest size.<br/>
**rule**: if a quarter-ellipse segment encounters only one requirement, it becomes a quarter circle and passes on the requirement to the next, unconstrained part(s).

### colors
The colours I use in my examples are 100% saturated, 100% brightness colours at 20% opacity. The hue is generated by dividing the 360° hue coordinate by 20 (no repeats for the first 20 objects): 18° hue increments.

Now start at hue = 0° for the first object and increment 72° for each next one, until back at 0°;<br/>
now start at hue = 36° for the next object and increment 72 ° for each next one, until back at 36°;<br/>
now start at hue = 18° for the next object and increment 72 ° for each next one, until back at 18°;<br/>
now start at hue = 54° for the next object and increment 72 ° for each next one, until back at 54°;<br/>
now start again from the top.

_yes, this has been tested for 8 types of color-blindness, with Sim Daltonism.app_