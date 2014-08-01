Metapolator is a parametric font tool. To work with parameters we borrow heavily from the Cascading Style Sheet language.

This file is a work in progress. It will lead us through the development
of our CPS Tools and eventually become the documentation thereof.


CPS is not CSS
--------------
We use another name, to make clear that you can't use the parameters that
you know from CSS, however, the syntax is very much the same. In fact, we
use a CSS Parser to read CPS.


### What we borrow

* The **syntax** when serializing.
* How the  **selectors** work; which allows us to specify rules for a set of
  elements or for just one distinct element.
* The **cascading** model where more than one rule can apply to an element,
  but the most specific one wins.
* To be continued.

### What we don't borrow

* the parameters that are used for HTML. Because we define our own parameters
  in a very extensible way: via plugins
* Concepts like media-queries. We might come up with our own @-Rules however.
* The full range of possible selectors. At least not from
  the very beginning. To select the glyph after the glyph 'a' (`glyph#a + glyph`)
  is a thing we can wait for a bit longer I think.
* …

### Why this is a good thing

* Many people know CSS, they will feel comfortable with CPS, too.
* We hope other applications eventually pick up CPS.
* You can use a text-editor to tweak your fonts.
* To be continued.

Concepts
--------

### Interoperability: We don't delete!

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

### The Broker

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

CPS Object-Model
----------------

In general the items in the CPS Object-Model are divided into two big categories:

* the ones we understand
* the ones we don't (even try to) understand, represented by the one single
  object-type, the `GenericCPSNode`.

The items we don't understand will have a string representation, that
resembles how the rule displayed in the source CSS. So we can use this
for the interface, or let the user choose to hide these pieces. We keep
these items around, so that we can just reinsert them in new serializations
of the CPS.

The items we understand will provide all the APIs we need to create and
change the parameters of Metapolator.

### Current State

The base for the CPS Object-Model is established in
[`app/lib/models/parameters`](https://github.com/metapolator/metapolator/tree/next/next/app/lib/models/parameters)

#### What we can do
  * parse a CPS/CSS string into the object structure as outlined below
  * serialize the object structure *back* into an equivalent CPS string (formatting
    differs, some comments may have another position, but at the element where
    they originally where found)
  * the object structure is ready to be filled with useful methods ;-)
  * we have ways to just keep unknown data around
  
#### What we can *NOT* do
  * understand properties, parse `ParameterValue`-objects or `Selector`-Objects
  * query the `ParameterCollection` for rules that apply for a certain object,
    this will need the MFOM (Metapolator Font Object Model) for interaction
    anyways.
  * change data in the object structure (we'll add APIs for that of course)
  * receive values from the structure

#### The Parser

After some tests the [Gonzales CSS Parser](https://github.com/css/gonzales)
was chosen. Not only because the name implies that it is fast ;-). Also,
because the Abstract Syntax Tree (AST) that it creates looks like
a very complete CSS implementation and it allows us to keep the parts we
don't interpret around, so we can obey the **"We don't delete!"** rule. First
tests showed, that we might even be able to restore the line numbers from
the AST (which it sadly does not provide by itself). That would be a great
help with debugging the CPS, the method used, however, still has to be
tested against the real-life.

The parsing of CPS/CSS with gonzales, reading the AST into the CPS-Object-Model
and serializing the result again can currently be seen in
[http://localhost:8000/playground.html](http://localhost:8000/playground.html).

##### Example roundtrip

Besides some reformatting into a much prettier form, the important
information here is that the *output* block is the result of a complete
roundtrip: `string -> gonzales AST -> CPS-Object-Model -> string`

input:

```css
body{ 
  background-color /*property comment*/: #fff;
  margin: 0 auto;
filter:progid:DXImageTransform.Microsoft.AlphaImageLoader(src='a.png',sizingMethod='scale')}/* And a comment */ strange>.selector/* selector comment 
 with linebreak */,and another onemissing.delim >{ any-param
: unheard-of(style + css);/* a comment within a block */another-one: def-unheard-of(style + css)/*this param has a comment*/;}@media whatever{ hi{name:val} }
```

output:

```css
body {
    background-color /*property comment*/:  #fff;
    margin:  0 auto;
    filter:progid:DXImageTransform.Microsoft.AlphaImageLoader(src='a.png',sizingMethod='scale');
}

/* And a comment */

strange>.selector/* selector comment 
 with linebreak */,
and another onemissing.delim > {
    any-param:  unheard-of(style + css);
    /* a comment within a block */
    another-one: /*this param has a comment*/  def-unheard-of(style + css);
}

@media whatever{ hi{name:val} }
```

The most intersting part happens in
[`app/lib/models/parameters/factories.js`](https://github.com/metapolator/metapolator/blob/next/next/app/lib/models/parameters/factories.js).
Where all the logic for the conversion from AST to CPS-Object-Model is contained.
The code is richly documented, so it may be worth a look.

One of the best things with the factory approach here is, that we could
change the parser without touching the CPS-Object-Model. We should work
in that direction and reduce all touching points with the AST of gonzales
to the factories module--this is not fully the case at the moment, because
some Object Model classes still receive `GenericCPSNode`-objects where there
should be processable values instead.
  
#### Docs

To parse CPS into the object model, the module `app/lib/models/parameters/factories`
provides the methods `rulesFromString` and `rulesFromAST`. Internally `rulesFromString`
uses gonzales to parse the string and then invoke `rulesFromAST` with the
AST from gonzales. The resulting object is an instance of `ParameterCollection`.

All objects used in the CPS Object-Model so far are:

* **`Source`** every `_Node` has one, so we can track the origin of it.

* **`_Node`** at the moment all items in the CPS-Object-Model inherit
  from `_Node`. `_Node` itself inherits from
  [`_BaseModel`](https://github.com/metapolator/metapolator/blob/next/next/app/lib/models/_BaseModel.js).
  `_Node` has the `Source` and line-number information of each CPS Object-Model
  item.
* **`ParameterCollection`** consists at the highest level of a list of
  `Comment`, `GenericCPSNode` and `Rule`-objects.
  
  `GenericCPSNode`-objects that only contain whitespace (type == "s")
  are dumped.
  
  <small>*equivalent gonzales AST item:* `stylesheet`</small>
  
* **`Comment`** can occur at different positions in the CPS. So far, nodes
  aware of comments are:
  * `ParameterCollection`
  * `Selector`
  * `ParameterDict`
  * `ParameterName`
  * `ParameterValue`
  
  <small>*equivalent gonzales AST item:* `comment`</small>
* **`GenericCPSNode`** This node stores the parts of the AST that we don't
                     interpret. It's the basic concept to achieve the
                     "We don't delete!" rule. A GenericCPSNode can be
                     converted back to a CPS-string without loss of
                     information.
                     GenericCPSNodes occur at different positions in the
                     Collection:
    * *`ParameterCollection`*
        for example @-Rules as in `@media screen {}`
        are not yet interpreted, they are just stored
        as GenericCPSNodes and recreated upon serialization
    * *`ParameterDict`* unknown parameters are/will be kept as GenericCPSNodes
    
    Also at the moment:
    * `Selector`
    * `ParameterValue`

    Both keep their contents as a mixed list `GenericCPSNode`s
    and `Comment`s, but this will change as soon as we start
    to interpret their values for our uses.
    
    <small>*equivalent gonzales AST item:* `(anything else)`</small>
    
* **`Rule`** Container for one `SelectorList` and one `ParameterDict`
    
    <small>*equivalent gonzales AST item:* `ruleset`</small>
    
* **`SelectorList`** Container for a list of `Selector`-objects
    
    <small>*equivalent gonzales AST item:* `selector`</small>

* **`Selector`** one CPS selector. The value of the
    selector is currently not further processed and consists of
    `GenericCPSNode`-objects and Comments. Whitespace is not removed because
    that could change the meaning of the selector.
    We'll have to interpret the value of a `Selector` further, waiting for
    the first use case.
    
    <small>*equivalent gonzales AST item:* `simpleselector`</small>
    
* **`ParameterDict`** a list of `Parameter`, `Comment` and `GenericCPSNode`
    And it will provide a dictionary like access to the `Parameter`-objects
    
    <small>*equivalent gonzales AST item:* `block`</small>
    
* **`Parameter`** a container for the key-value pair of `ParameterName` and 
    `ParameterValue`
    
    <small>*equivalent gonzales AST item:* `declaration`</small>
    
* **`ParameterName`** the name of a `Parameter` and a list of `Comment`-objects
     (that's possible in CSS). The list of comments can be empty of course.
     
     <small>*equivalent gonzales AST item:* `parameter`</small>
     
* **`ParameterValue`** the value of a `Parameter`, currently list of
    `GenericCPSNode`-objects and a list of `Comment`-objects.
    This current state with the `GenericCPSNode`-objects will change when
    we start to interpret the value. Also, at the moment, this results in an
    unfortunate situation when serializing, because we have to keep the
    whitespace information around. When the values are interpreted,
    the whitespace situation will resolve.
    
    <small>*equivalent gonzales AST item:* `value`</small>

The CPS interface
-----------------

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
Change RuleSets (CRUD), Reorder stuff, Edit Comments (CRUD)

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
