This outlines an alternative approach to
[CPS interpolation](https://github.com/metapolator/metapolator/wiki/CPS-interpolation)
also attempting to find a solution for
[issue #126 Add crude interpolation](https://github.com/metapolator/metapolator/issues/126)

The main issue I have with the original approach, **as well as with the
task formulated originally in the "Metapolator August Goals: Useful Code"
document** is that it tries to create a *new set of Rules* implying to
create a *new master* (emphasis added by the author):

> 2 . Interpolation between 2 masters to create **a new master**,
>using a StyleDict-like interface
>
>* interpolation of outlines (limited in use)
>* interpolation of different CPS rules, resulting in **a new set of rules**. 
>Initial crude version: import two masters, interpolate at 0, 0.25, 0.5, 
>0.75, 1 and export the 5 resultant new masters (hopefully, only 3 are really new!).
>* TODO more ideas

I think interpolating different rules is hard to do, because they are
different: they may not fit together, order is also important and in the
end not all rules present in a master are necessarily used (i.e. due to
overriding of rules) etc. so we can't create a comparably meaningful/semantic
set of rules from an input of N sets of rules. Instead we'd have to create
new rules for each item in the input masters, which would be like 'flattening'
the rules into a very simple form. The result would probably not be as 
comprehensive as the input data, on top of it, even the information that 
we interpolated the master from other masters itself would be lost.

## InterpolationMaster
The original proposal interpolates parameters differently by using different
rules provided by a special CPS/interpolator notation. This is meant
to provide a facility which allows different interpolation for different
parameters---a request we hear sometimes.


I will sketch a system that allows a different change rate of parameters
by creating [a further approach to interpolation](#a-further-approach-to-interpolation)

When I wrote *"using a StyleDict-like interface"* in the initial task
description I did not think that creating new physical masters by using
a complete interpolation of the input masters would be the way to go. I'm
sorry for initially creating a very badly formulated task, this led to
edits (not by me) that changed what I formulated---as a gut feeling on where
to tackle the task---even more. Now I spent some time thinking on the task
of interpolation and I will provide very concrete examples and where in
the current code base we will have to edit.

The `StyleDict` thought comes from the fact that reading of the concrete
parameter values of a MOM-Node happens via the `StyleDict` Interface, currently
the most/only important example is
[ExportController.js](https://github.com/metapolator/metapolator/blob/master/app/lib/project/ExportController.js).
We can see that the reading of concrete values boils down to a pattern
like this:

```js
// get the StyleDict for the MOM Right node 'points[i].right'
// 'model' is the ModelController that controls our MOM-Tree and CPS data
pointStyleDict = model.getComputedStyle(points[i].right);

// ... later
// read the value of the 'on' parameter from the previously obtained
// StyleDict
pen.addPoint(pointStyleDict.get('on').value.valueOf(), segmentType,
             undefined, undefined, {precision: precision});
```

The idea is, that a call to `getComputedStyle` could return different
implementations of `StyleDict`. I.e. one that would itself return
*interpolated* values when asked (by using its `get` method) or one that
returns just the values from the applied CPS rule, as it is currently.

In that case, code that uses `StyleDict`s to read Parameter-values---which
is the one way anyways---would work to render both "concrete masters" or
something like "virtual masters", that are constructed using two or more
masters (concrete or virtual, because the StyleDict interface connects 
everything) in an interpolation context. Other mechanisms to provide the values of
Parameters are possible, too, important is that the StyleDict implementations
are compatible.

Thus in our case we would like to somehow inform our instance of `ModelController`
that we want to have a `StyleDict` for an interpolation between N masters.
There must also be a way to define the amount of each master that goes 
into the resulting values.

For a pure interpolation all the masters and the amount of them must be defined:

```js
// all `master_*` masters are from the same `Univers`, although this may
// not be necessary, but it ensures that the parameters are compatible
// Another MOM Master type is needed: InterpolatingMaster
imaster = new InterpolatingMaster(master_0, master_1, master_N);
// setting up the instance:
imaster.setProportions(0.2, 0.3, 0.5);
model.addMaster(imaster);


// later in ExportController, as seen above
pointStyleDict = model.getComputedStyle(a_point_descendant_of_imaster.right)
pen.addPoint(pointStyleDict.get('on').value.valueOf(), segmentType,
             undefined, undefined, {precision: precision});
```

Under the hood, the interpolation should be done similar to what the initial
interpolation proposal described: Parameter definitions know themselves
how to interpolate between values. The request to: `point.get('on')`
would result in three requests, somewhere along these lines:

```js
// this is called via: pointStyleDict.get('on')
InterpolatingStyleDict.prototype.get = function(name) {
    // this is not working code
    // this is also very verbose, we would gather these values using a
    // loop in some form.
    var dict_0 = model.getComputedStyle(point_of_master_0)
      , dict_1 = model.getComputedStyle(point_of_master_1)
      , dict_N = model.getComputedStyle(point_of_master_N)

      , val_0 = dict_0.get('on')
      , val_1 = dict_1.get('on')
      , val_N = dict_N.get('on')

      , values = [val_0, val_1, val_N]
        // proportions was set above
        // using imaster.setProportions(0.2, 0.3, 0.5);
      , proportions = this.proportions
      ;
    // the logic of how to do interpolation is offloaded to the implementation
    // of the data type
    return parameter_description_for_on.interpolate(values, proportions);
}
```

#### What's missing from this example:

* We need a new MOM Node Type `InterpolatingMaster`, this one would
  inherit from `Master` or both would inherit from a newly introduced `_Master`
  MOM Node;
* `modelController.getComputedStyle` would have to check the `element.master`
  property to know how to create the appropriate StyleDict for a element.
  The master should maybe provide an API to help with the task of either
  deciding the type of the `StyleDict` or to create the `StyleDict`.
* We need a new `StyleDict` that is capable of interpolation as described
  above. Thus the StyleDict API becomes the core concept and the
  Implementation becomes a Detail.
* It would be ultimately cool to be able to write CPS rules 'on top' of
  virtual masters (I call a InterpolatingMaster 'virtual'), but we'd
  need to solve some logical issues around specificity i.e. how to 
  determine the specificity of an interpolated rule and such (also, maybe 
  this is easy but to early to judge now).

### Thinking about design space

Notice that the example from above:

```
imaster = new InterpolatingMaster(master_0, master_1, master_N);
imaster.setProportions(0.2, 0.3, 0.5);
```

Constitutes a 3-dimensional design space which we can 
explore by using the `setProportions` method. Since the proposal does not 
limit the number of masters used with `new InterpolatingMaster` 
(hence the last argument is called `master_N`) an N-dimensional design space 
is possible. (If we insist that the proportions add up to 1, the design-space loses a dimension, and becomes bounded.)

Also, we can use other instances of `InterpolatingMaster` as input
to create a new instance of `InterpolatingMaster`, this allows even
more complex setups.

### Creating an actual master (if needed one day)

This could be done by plugging the functionality of ExportController 
and ImportController together, using the pen protocol for the most important
parts. This needs some rewriting of both modules, to open up the APIs for
this use case. That way we can at least create a master that obeys the
default.cps and that is constructed the same way as a fresh import.
Then, the structure and setup of that new master follows the established
practices, which is what the user will be used to.

## The Crude Interpolation Implementation: 

What I described above should be enough to fuel the Metapolator model of
working with Masters and design spaces. Different
implementations of MOM `*Master` and `StyleDict` will let us create even
more new ways of exploring design spaces.

This is a (hopefully complete enough) roadmap, how I would implement the 
first level of interpolation. Resulting in the ability to export instances,
but also a good base to work with interpolations as masters.

1. Implement a `interpolate` method for each CPS-Data-Type where it is
   useful. This is registered via parameterRegistry and thus located next
   to 'init', 'defaultFactory' etc. I suggest an interface like
   `interpolate(valuesArray, proportionsArray)`
   
   This should not need to be able to combine function descriptions,
   because it will be enough to work with the results of the execution
   of these functions.
   
   Also, depending on the yet to come parameter types, being able to
   interpolate these values may not be possible or useful. I'd implement
   in the first run only the really needed types. Maybe we'll need to
   classify data-types whether or not they may be used in an interpolating
   context. For example, the `on` parameter must be interpolatable,
   but it would not make much of a sense to interpolate a switch that 
   changes how the `on` parameter is calculated. A missing `interpolate`
   method could imply that.
2. Implement `_AbstractStyleDict` 
    * defines the public interfaces that are needed but raises
    `NotImplementedError` on usage of these methods 
    * documents what is expected from concrete implementations 
    * provides shared/commonly needed methods
   
   *Note: the undersore in the name implies that `_AbstractStyleDict`
   should not be used directly as a constructor*
3. Make `StyleDict` a child of `_AbstractStyleDict`, so that:
   `styleDictInstance instanceof _AbstractStyleDict === true` At this point
   we could also rename `StyleDict` into `CPSStyleDict` , `SimpleStyleDict`
      or something along that line.
4. Implement `InterpolatingStyleDict`, so that:
   `interpolatingStyleDictInstance instanceof _AbstractStyleDict === true`
   and so that it returns correctly interpolated values when its public
   interfaces are used. Also, note, that the `proportions` information
   must obey to a centrally managed entity (maybe a shared reference to an
   array or object in master, which may be given on initialization)
   
   Also on initialization, we'll need to receive a reference to the source
   `StyleDicts` to be used. Since `StyleDicts` are managed and cached via
   `ModelController` and because we don't want to create memory leaks
   at this point, we would rather use the appropriate MOM elements and
   the `getComputedStyle` method of the current `ModelController` to
   receive the needed `StyleDicts`.
   
   If we use a caching mechanism like the current `StyleDict` does, changes
   on `proportions` must yield in cache invalidation. Maybe we could just
   safe a string representation of the `proportions` array, and when the
   value changed since the last call to `get` the cache is invalid.
5. let `ModelController.getComputedStyle` interface with `element.master` 
   to receive a blueprint/factory/hint how to build an appropriate
   implementation of `StyleDict`. At the moment much of this is done in 
   `ModelController`, but it may be wise to do this in a factory or method
   of the master.
   
   The master could and maybe should use APIs of the model to fulfill this task. 
   
6. Create a property or method in MOM `_Node`, similar to `particulars`
  (MOM `Master` has an overridden version) that creates an unambiguous 
   selector for each element based on its position in the MOM tree hierarchy.
   
   Interesting for our case of `InterpolatingMaster/InterpolatingStyleDict`
   is that `getComputedStyle` will receive an `element` that is a child of
   the instance of `InterpolatingMaster`. That master hast N references to
   other masters. We need to query all these master for their analogue of
   `element`.
   
   The property `MOM _Node.particulars` gives hints on how an appropriate 
   selector can be constructed. I suggest leaving out the "#id" selectors,
   because they are not needed to establish compatibility between masters.
   Instead a selector that uses the index pseudo-class selector `:i(0)`
   for each element in the selector should be good. As a combinator
   `>` shoul be good.
7. Implement MOM `_Master` as a base class for all Master implementations
   to come. Take the current MOM `Master` as a base. Of course only
   commonly needed functionality should eventually remain in `_Master`
8. Implement MOM `Master`, so that `masterInstance instanceof _Master === true` 
9. Implement MOM `InterpolatingMaster` , so that `interpolatingMasterInstance
   instanceof _Master === true`
   * InterpolatingMaster takes N instances of _Master as input
   * interpolatingMaster.setProportions() takes  N (number of masters) arguments
     that are preferably numbers between 0 and 1 and sum up to 1 (also,
     other numbers should be possible, it's just not the most common case)
   * on initialization we need to create a MOM tree for all children of 
     the new master. I would initially do this by just creating an analogue
     structure to the first given master, also this raises some questions:
        
        * eventually we should check for compatibility. There are different
          options to react when the input masters are incompatible:
          reject/raise an exception or use the compatible subset of children.
          Although, the compatible subset of children may change after
          initialization!
        * It may be worth to think about how redundant MOM-Master copies
          can be avoided effectively. Also this would make it in the end
          very easy to check for compatibility. Maybe, we can remove the
          possibility for incompatible master completely by enforcing
          one structure that is used for all masters. This also questions
          the whole model of the MOM as it. But this goes beyond this proposal.
   
10. profit:
   
   ```js
   // somwhere in MetapolatorProject
   var imaster = new InterpolatingMaster(master_1, master_2);
   imaster.id = 'myFirstInterpolatingMaster';
   this._controller.addMaster(momMaster, parameterCollections);
   
   // somwhere in a command
   var selector = 'master#myFirstInterpolatingMaster'
     , instances = (
            (1,0), (0.75, 0.25), (0.5, 0.5), (0.25, 0.75), (0,1)
       )
     , master = metapolatorProjectInstance.controller.query(selector)
     ;
    instances.forEach(function(proportions, i) {
        master.setProportions.apply(master, proportions);
        metapolatorProjectInstance.exportInstance(selector, 'instance'+i, 4);
    })
   ```


## A further approach to interpolation

While the approach before describes how to interpolate between
'given' masters there is also another more-or-less obvious aproach. Suppose
we did set up a master with some fixed value for a "width". We could set
up a second master with a different width and interpolate between both,
using an `InterpolatingMaster`. Alternatively, just changing the
"width" would ultimately result in the same "instances" of the master,
given that the value of "width" stays in the same boundaries.

This behavior could be achieved by animating a value in cps itself or
by referencing a value outside of cps that is interpolated there (a
property of master for example). The important point is that we should
institutionalize a way to do this kind of interpolation.

We could make an axis by animating different values like:<br />
`width`, `x-height`, `boldness`<br />
and we could make it possible to use different functions for each value,
not just the same linear function. The important thing is that we get an
output t for every input t. To make it easy to use, t is usually between
0 and 1 ... when not extrapolating.

A travel between min and max would look like so: `min + max * t` a setup
that is well thinkable inside of CPS! t would be a reference to an *"outside"*
value between 0 and 1, I suppose. Also, we might come up with an
"interpolation-function" cps parameter that would let us define a transformation
for an input t to an output t (default: linear), this way we could define
the change rate of a value, when interpolating between 0 and 1, from within
CPS. This would create a nice interface for interpolation, where we change
one single value "t" and create differently strong reactions at the parameters.

This could probably be achieved with existing implementation of `Master`
and some new and adapted CPS data types.

In the end we should provide a unified interface to define axis, so that
traveling from one instance of a master to another instance of a master
can be described. Whether or not this all must/will happen from within CPS,
I wouldn't want to decide it now and here.
