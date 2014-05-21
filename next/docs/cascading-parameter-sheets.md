Metapolator: Cascading Parameter Sheets
=======================================

Metapolator Neue, is a parametric font tool. To work with these parameters
we borrow heavily from the Cascading Style Sheet language.

This file is a work in progress. It will lead us through the development
of our CPS-Tools and eventually become the documentation thereof.


CPS is not CSS
--------------
We use another name, to make clear that you can't use the parameters that
you know from CSS, however, the syntax is very much the same. In fact, we
use a CSS-Parser to read CPS.


### What we borrow is:

* The **syntax** when serializing.
* How the  **selectors** work; which allows us to specify rules for a set of
  elements or for just one distinct element.
* The **cascading** model where more than one rule can apply to an element,
  but the most specific one wins.
* To be continued.

### What we don't borrow is:

* the parameters that are used for HTML. Because we define our own parameters
  in a very extensible way: via plugins
* Concepts like media-queries. We might come up with our own @-Rules however.
* The full range of possible selectors. At least not from
  the very beginning. To select the glyph after the glyph 'a' (`glyph#a + glyph`)
  is a thing we can wait for a bit longer I think.
* To be continued.

### Why this is a good thing

* Many people know CSS, they will feel comfortable with CPS, too.
* We hope other applications eventually pick up CPS.
* You can use a text-editor to tweak your fonts.
* To be continued.

Interoperability: We don't delete!
----------------------------------
To create the maximum of interoperability with other tools, that pick
up our CPS approach, we try to preserve as much of information of loaded
Parameter-Sheets as possible. That means: *We keep what we don't understand
and just output it again when serializing our CPS*

This is great, because it enables other apps to create their very own set
of parameters and selectors, and we can still load their CPS without
destroying that data. We will even be able to load CSS from any Website,
then export it again and it should still work. But this are only extreme
cases, **a very practical case** would be to load a **CPS from another
Metapolator Project**—that may use other Plugins and thus can define other
parameters—and still be able to operate on the set of available parameters.
We can load parameters from Helevetica into Baskerville, if we choose to.
However, to cool the temper, on a glyph level that will not be of much use,
because the skeletons are very different.


The Parser:
-----------
After some tests the [Gonzales CSS Parser](https://github.com/css/gonzales)
was chosen. Not only because the name implies that it is fast ;-). Also,
because the Abstract Syntax Tree (AST) that it creates looks like
a very complete CSS implementation and it allows us to keep the parts we
don't interpret around, so we can obey the "We don't delete!" rule. First
tests showed, that we might even be able to restore the line numbers from
the AST (which it sadly does not provide by itself). That would be a great
help with debugging the CPS, the method used, however, still has to be
tested against the real-life.


Building the CPS Viewer and Editor
----------------------------------

### Concepts

####The Broker

We are planning a to include multi-user scenarios, where a lot of people
can edit one project simultaneously. Therefore we need to restrict the
access to the data-model using special APIs. Since our planning for the
multiuser editing is not finished yet, I suggest that we approach the problem
by setting some rules, that in the best case will just hold true when we
encounter the real problem and in the worst case shields us from having a
lot to rewrite.

So far, the plan is that we are round-tripping a change from the UI to the
model and beyond. The UI will commission changes on the data, but the
authority to change that data will be in the responsibility of other code,
namely, a concept that we call the "**Broker**" for now. The Model, from
the perspective of the UI will be an API of the Broker. The Broker, will
inform the UI of changes on the model (using an event/message like system
probably). There should be no difference from where the change was made,
either from the local computer or from one far away. So when the UI changes
a parameter, the value will be in an "unresolved" state, unless the broker
sets it to its new value. This must be, because we don't want to reset the
display of the value after we submitted the change-request, this would only
cause confusion. This, however, implies that we should lock the value until
we receive the answer, otherwise the user might be confused by the control
element moving autonomously.

CPS Data-Model:
---------------

I started to parse CSS using Gonzales and to read the AST into a usable
structure. So far it seems like there will be two fundamental different
Items in the result:

* the ones we understand
* the ones we don't (even try to) understand **Generic AST-Items**

The items we don't understand will have a string representation, that
resembles how the rule displayed in the source CSS. So we can use this
for the interface, or let the user choose to hide these pieces.

The Items we understand resemble the most basic pieces of the CSS-Syntax
(using the names of gonzales, might change):

* **ruleset** consists of selectors, a declaration and comments
* **comment** we'll keep comment and make them editable. This will help greatly with complex tasks.
* **selector** all "simpleselector"s of one rulest, can contain comments, too
* **simpleselector** one selector
* **block** everthing between {}, so declarations and comments
* **declaration** has a property (name) and a value
* **property** the name of the property
* **value** the value of the property

The beginning of parsing css with gonzales and reading the AST can currently
be seen in [http://localhost:8000/playground.html](http://localhost:8000/playground.html).
The most intersting part happens in `app/lib/models/parameters/factories.js`.
At the console an object is emitted (at the end) which prints a CSS-Rule
Tree from the AST, sorted into "Generic AST-Items" and "Specific" items.
This is, however, at a very basic state, but works implies already, that
our tactic will work.

The CPS interface:
------------------

I suggest 2 stages: The first as a pure display of the model. The second
stage would add the ability to change values. There a more features
that we are going to add subsequently.

We will start with a very simple viewer, that takes a CascadedParameters
object and displays its values. We will differentiate between raw AST items
and items that we understand.

* The **Generic AST-Items** (and others that we don't touch, if there is more)
  will have a text only representation, and may be relocatable and deletable
  manually by the user.
* Plugins will define the available parameters AND how to display and change
  them, this includes information like: value ranges, kind of value, tooltips,
  further documentation etc.
  So we can, in the end, have interfaces like sliders, switches, text-fields
  etc.

### Two Modes
**Both Modes**
Change RuleSets (CRUD),  Reorder stuff, Edit Comments(CRUD)

Both modes load using a CascadedParameters object, the CascadedParameters
may expose useful API-methods, so that we can keep knowledge away from
the UI wherever possible.

**File Mode** Display one "file" or more exact "source" of CPS. This will
make it possible to change the order of RuleSets.

**Entity Mode** This will display all Rulesets that apply to one entity,
pretty much like Firebug does when selecting one single element. The RuleSets
will be expose including their information about their source
(name and line number). This will, similar like in Firebug, display which
parameters are responsible for the final value and where overridden. The
ordering will not be created by the UI, but by Model API, as well as the
selection of the applying rules are made in Model-land.
