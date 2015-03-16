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
Her is the list of _possible_ parameters we could support:

* Width
* Height
* Slant
* Tension (modifies in & out)
* Weight
* horizontal metrics _(all measured to skeleton)_
  * spacing _(total space surrounding this glyph, = front + back)_
  * sidebearings _(value pair, e.g. “40|30”, = front|back, **not** left|right)_
* X-height _(tricky, works only for latin and needs preparation in the incoming ufo)_

These work on the selections that can be made in the specimen, i.e. (multiple) masters and (multiple) glyphs.

**local menu**: none

### interim design

Analysing what’s different about the parameter system for the working UI demo, we see the following:

* **only two levels**: master and glyph; this simple display and control hierarchy means that we can drop the support for indicating and tracking back (across an eight-level hierarchy) of ‘where did this value come from?’ or ‘whats the fall-out from this?’
* **only eight parameters, _max_** which are the same for both levels (there _are no_ master parameters, in general);
* **lots value ranges** instead of single values; with the sub-glyph levels missing, the chance of looking at ranges has gone up drastically; let’s design modification of these ranges (changing the end-point values rejigs the whole range).

What stays is a system of **operators** (=, ×, +, max, min)—completed (with - and ÷) for straightforward expression—which can be combined at will at all (2) levels of the hierarchy. This allows for some manipulation power. _Example: for this master (or selection of glyphs), divide the Weight by 1.2, add twelve units to the Weight, maximum Weight is 24 units and minimum Weight is 7._

#### hierarchy
No matter what is being shown in the parameter panel, the layout maintains the following display hierarchy (in top–to–bottom order of display):

* level 1 **section**:
* master
* glyph
  * level 2 **parameter**:
  * Width
  * Height
  * X-height
  * Slant
  * Spacing
  * Sidebearings
  * Tension
  * Weight
    * level 3 **operators and values**:
    * = (assignment) or : (inherent value)
    * ×
    * ÷
    * +
    * -
    * min
    * max
    * effective value
      * level 4 **value range**:
      * lowest value
      * highest value

_This means that the parameter panel is split in two, a master and a glyph part; each of these parts has a lists of parameters; each parameter shows the operators that are set and (when needed) the effective value; when the value of an operator is a range, the lowest and highest value are shown._

#### an overview

![](http://mmiworks.net/metapolator/demoparaoverview.png)

_An example shows how the parameter panel works, currently one glyph is selected in the specimen. At the top is the master section, where any number of parameter expressions can appear that work on the whole master. In this case two have been defined for this master, for Width and Slant. Both Master and Glyph sections have Add buttons (not Swiss flags) in their headings to add more expressions._

_In the glyph section all parameters are shown (in this case all possible 8). Each one has an assigned value (=) or an inherent value (:) coming from lower levels that we cannot display right now. Independently, Tension and Weight also show that a range of values exists for this selection (the glyph). The black pen nib symbols indicate that 4 parameters have effective values, resulting from expressions. For Width and Slant this is the result of the Master expressions, for Spacing and Sidebearings it is the result of a single local expression (these parameters are coupled by Spacing = Sidebearing-front + Sidebearing-back)._

#### starting simple
Here are the absolute simplest forms the parameter panel can have. This is what we expect to show right after a ufo has been imported.

When one or more masters are the selection:

![](http://mmiworks.net/metapolator/demoparasimplemaster.png)

The simplest state is no expressions at master level and glyph level is never shown for master selections.

When one or more glyphs are the selection:

![](http://mmiworks.net/metapolator/demoparasimpleglyph.png)

The simplest state is no expressions at master level and at glyph level all the parameters are shown with straight values. Most of the parameters are best modelled as being glyph-level and can be represented with a value-assignment expression. Some parameters are obviously sub-glyph parameters (Tension & Weight) and shown to have inherent values. 

##### ranges
It is very normal that even in this simplest form ranges are shown.

Ranges are shown when for a parameter expression multiple, and different, data values are stored. This can be the case for multiple selections and for sub-glyph parameters (Tension & Weight). When multiple values are stored that are all _exactly_ the same then there is no range.

When a multiple selection is the context and for some of the selected objects a parameter expression is define _(say + 2)_ and for the rest not, then for the ones missing a **trivial expression** is inserted _(in this example + 0)_, which builds a range to display _(+ 0 to 2)_.

The trivial expressions are: × 1, ÷ 1, + 0, - 0, max \<assigned/inherent value\>, min \<assigned/inherent value\>.

##### action!
To achieve their goals users can perform the following actions:

* add expressions to the master and glyph sections;
* change expressions or remove them;
* change any of the values in the right-hand column.

We will look at each of these now.

#### adding expressions
When the Add button is pressed on one of the sections, a popup panel is shown:

![](http://mmiworks.net/metapolator/demoparaadd.png)

The panel has two columns of pushbuttons (highlights on mouse-down, invokes on mouse-up inside, bails out on mouse-up outside area), one for picking a parameter, one for picking an operator. The order of picking them does not matter (parameter first or operator first), the button invoke that completes a parameter + operator choice closes the panel, inserts the parameter + operator expression in the section according to the [hierarchy](https://github.com/metapolator/metapolator/wiki/working-UI-demo#hierarchy) with a focussed, empty value field.

When the first choice has been made:

![](http://mmiworks.net/metapolator/demoparaadd1.png)

another choice in the same column can still be picked by clicking it (i.e. the column shows radio behaviour after the first click).

Clicking the full-width & bold Cancel button at the bottom closes the panel without adding any expression to the section, as does clicking outside the panel at any time.

##### unique expressions
The value assign (=), min and max operators can only be defined once for each parameter, for each section. We arrange this for these operators by making an parameter + operator unavailable when it is already defined in that section. When the parameter is picked first, the operator is greyed out, when the operator  is picked first, the parameter is greyed out.

_Example: Width-min is already defined for the glyph section. When the Add panel is shown for that section, both Width and min are normal and active. When Width is picked first, min becomes greyed out. When min is picked first, Width becomes greyed out._

In extreme cases any of the =, min, or max operators may be greyed out when the Add panel pops up, because all parameters already define it.

##### consolidated expressions
The design must strike a delicate balance between allowing users to define expressions for randomly overlapping glyph and master selections, helping users with math, and ensuring that the parameter panel view does not contain ‘spaghetti code’ of operator lines.

To achieve the first two goals, we will allow users to enter any number of operators, just so that they can reach their goals:

![](http://mmiworks.net/metapolator/demoparamulti.png)

_(here is a nice example of a range in the master parameters; glyphs of several masters have been selected here and they have a range of slants on master level. the adjustment done here to the slant of the master _does_ apply to all glyphs in those masters, and not just to the selected glyphs.)_

To achieve the goal of ‘no spaghetti’, we will clean up after users by consolidating each of the ×, ÷, +, - expressions:

![](http://mmiworks.net/metapolator/demoparaconsoled.png)

The right moment to perform consolidation is when the selection that is the context of parameter work finishes, i.e. when the selection in the master list or specimen changes. For **each** of the Master and Glyph sections, and for **each** parameter, individually:

* if there are multiple × expressions, consolidate them into one by multiplying the individual values (new value is one? fine, just put it);
* if there are multiple ÷ expressions, consolidate them into one by multiplying the individual values (new value is one? fine, just put it);
* if there are multiple + expressions, consolidate them into one by adding up the individual values (new value is zero? fine, just put it);
* if there are multiple - expressions, consolidate them into one by adding up the individual values (new value is zero? fine, just put it).

We see in our example that consolidation is also applied to ranges.

Why not consolidate × with ÷ and + with -, makes math sense, no? Because we do not know and cannot judge **why** some expressions were entered as × and some as ÷, some as + and some as -, we better not go too far.

#### removing and changing expressions
In principle any parameter expression can be removed, or have its parameter or operator component changed. These change actions are really the same as removing the old and adding the new expression, including starting out again with a focussed, empty value field.

Some expressions cannot be removed, nor changed, **all of these are in the glyph section**—

* any effective value expression;
* any inherent value expression;
* any value assign expression that on removal would be automatically replaced by an inherent value expression **with the same value**.

Any expression that can be removed/changed highlights on mouse-over (no delay) the area taken up by the operator and—if it is displayed at the same line as this operator—the parameter label (all possible shown here):

![](http://mmiworks.net/metapolator/demoparachangeme.png)

clicking on either a parameter label or an operator shows different popup panels. For parameter labels, this popup is shown:

![](http://mmiworks.net/metapolator/demoparaparapop2.png)

it is a variant of the Add popup with the following changes:

* only one column: the parameter column with the correct parameter label highlighted;
* invoking any other parameter button closes the popup and changes the parameter of the expression (remember: remove then add);
* the Remove button at the bottom removes the expression from the section (no warning);
* a click on the highlighted button closes the popup without changing anything, as does clicking outside the panel at any time.

For operators, this popup is shown:

![](http://mmiworks.net/metapolator/demoparaoppop2.png)

which works analogue to the parameter one, just changes the operator.

**note**: that both of these popup also implement the greying out of [unavailable combinations](https://github.com/metapolator/metapolator/wiki/working-UI-demo#unavailable-combinations).

#### changing values
**Every** value in the right hand column can be edited. **Every** one of them highlights on mouse-over (no delay). A click puts the value in edit mode.

When a new value is committed by users (i.e. by a return or on blur) the data of the selection and the display in the specimen is updated. _This is a bit of a deliberate slowdown, I do not think we can afford real real-time tracking of input values in the specimen._

**special rules** for some operators:

* committing a new value for an **inherent value** operator (:) changes it to a value assign (=) one;
* committing a new value for either **min** or **max** operator triggers a check: that for this parameter there is not a min expression with a higher value than a max expression; note that the min and max can appear in both Master and Glyph sections, and that only effective expressions matter; _a min that is defined in the Master section but is overridden by a min in the Glyph section does not matter;_
  * when the x-over occurs (min higher than max), then the value that was just committed is not used for data and display, the value field is kept/brought back to edit state (even scrolled back into view when necessary) and the text of the field is drawn in red.
* committing a new value for an **effective value** (i.e. overwriting a calculated outcome) triggers a **calc-back**: the inverse of the [math section](https://github.com/metapolator/metapolator/wiki/working-UI-demo#the-math); here it is in strict order:
  1. if a min or max is defined for this parameter and the new effective value can be made valid by simply redefining the value of this min or max (to the same value), without the need to touch the assigned or inherent value, then **just do it** and stop evaluating the rules below;
  * apply the inverse of any master-level addition (+) and subtraction (-) expressions;
  * apply the inverse of any master-level multiplication (×) and divide (÷) expressions;
  * apply the inverse of any glyph-level addition (+) and subtraction (-) expressions;
  * apply the inverse of any glyph-level multiplication (×) and divide (÷) expressions;
  * the value that is the result from the computations above is the new assigned value (=) of this parameter (if it had an inherent value (:) up to now, this is replaced by an assigned one);
  * done.

##### changing ranges
When either the highest or the lowest value of a range has a new value committed, the whole range is changed proportionately by it. If hi<sub>old</sub> and lo<sub>old</sub> get changed to hi<sub>new</sub> and lo<sub>new</sub> (really only one of hi or lo gets changed per commit, yes), then for every Value<sub>old</sub> in the range Value<sub>new</sub> = lo<sub>new</sub> + ( (hi<sub>new</sub> - lo<sub>new</sub>)/(hi<sub>old</sub> - lo<sub>old</sub>) ) * (Value<sub>old</sub> - lo<sub>old</sub>).

Yes, a range change can x-over (e.g. range is 10–50, 10 gets changed to 100, result is 50–100). The math above simply handles that, as long as we on commit of that 100 check which on is the new hi, and which the new lo (and also stick the two numbers in the right place in the UI).

What if hi<sub>new</sub> = lo<sub>new</sub>? That could be intentional (fold a range into a single value) or just a mistake. We cannot know, so we better ask. A dialog with text “Replace the range of \<lo<sub>old</sub>\> to \<hi<sub>old</sub>\> with the single value \<Value<sub>new</sub>\>?” and OK and Cancel buttons.

The range that is being changed can be of effective values (actually, that is a compelling reason for having this). Then two situations can occur:

1. the path of max, min, -, +, ÷, and × expressions to the value assignment contains **only single values**; then it is simple enough to take the new value committed, do a calc-back and find out whether a min, max or one of the value assign range needs changing, do it and have the fallout trickle down the system; this builds the effective value range;
* the path of max, min, -, +, ÷, and × expressions to the value assignment contains **one or more ranges**; in that case the effective value range is first change proportionately, then each new effective value is calc-ed back, via its own expression path, to a value-assignment value; this builds the value-assignment range.

#### the math
Calculating the effective value of each parameter is done in the following, strict order:

1. take the assigned or inherent value—
  * an assigned value on any level beats an inherent one;
  * an assigned value on glyph level beats an assigned value on master level.
* apply any glyph-level multiplication (×) and divide (÷) expressions;
* apply any glyph-level addition (+) and subtraction (-) expressions;
* apply any master-level multiplication (×) and divide (÷) expressions;
* apply any master-level addition (+) and subtraction (-) expressions;
* apply any minimum value (min) expression;
  * a min on glyph level beats a min on master level.
* apply any maximum value (max) expression;
  * a max on glyph level beats a max on master level.
* done.

We see that by and large this follows the order of display of expressions.

#### layout and typography hints
Just some input for visual design and development.

**note** that in general laying out the parameter panel is like laying out a telephone book; it’s tight, with many rows of name and number.

![](http://mmiworks.net/metapolator/demoparaalign.png)

We see that the layout is built out of two columns, within which all text is right-aligned. I put two spaces between the parameter label and the operator and two spaces in front of every value to determine the width of the value columns.

The sign for effective value is from zapf dingbats (black nib).

There is extra leading under every 3rd parameter (I used 5pt). After every range and energy effective value there is a bit (2pt) of extra leading (but not where the 5pt just mentioned is applied).

Some of the ‘extra’ structural text (“to”, ‘°’, the ‘+’ that separates the two sidebearings) are toned down. I used 50% grey (cf. black).

If the Sidebearings label is set in a condensed front, then the mid-axis can be shifted to the left and there is room for longer value numbers. 6 digits, with still room for a minus and a decimal point should do it. We should avoid crazy long fractional parts. Four fractional digits (1.2345) should be good enough for anything (said Bill Gates), and 1.3000 shall be displayed as 1.3 (i.e. chop off trailing zeros in fractions). Fingers crossed that the individual sidebearings numbers fit in 3 digits…

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
* Delete

## font export panel
I will design something super-simple that warns how long a font export will take (estimate): “this export will take approximately 3 hours, 43 minutes.” ah, and a progress bar while it is exporting.

Simple default opentype mapping: when an instance is metapolated from masters that all stem from one imported ufo **and** that ufo has opentype features, then the instance will have these features set automatically (as indicated in the fonts panel). 

### local menu
The local menu is as follows:

* Check All
* Uncheck All
* -- \<separator\> --
* Copy Opentype Features from Master…
* Copy Opentype Features from Font…
* Load Opentype Features File…
* -- \<separator\> --
* Remove Opentype Features

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