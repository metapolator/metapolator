For explanations of the datatypes, see [[cascading parameter sheets]].

A CPS interpolator is a `StyleDict`, that is, a list of `Rule`s. When interpolating /N/ masters, each `Parameter` whose `ParameterValue` is a list of /N-1/ real numbers is considered (we can either require that all parameters are valid interpolations, or ignore those that aren't).

The interpolator interpolates in two senses:

1. Its `StyleDict`'s `Rule`s select some parts of each interpolated master.
2. Its interpolating `Parameter`s interpolate between the relevant values of each master.

For the purposes of interpolation, a master is itself considered to be a `StyleDict`. *(RT: Presumably there's more to it?)* The interpolation process then uses the interpolator's `Rule` list to select the `Node`s of each master that will be added to the interpolation, and adjusts the `Parameter`s of each selected `Node` according to the interpolation vector, assuming that each font contains a corresponding `Node`.

# Open questions

1. What to do when only some fonts contain a corresponding `Node`? In the case of interpolating two masters, it would seem sensible just to use the `ParameterValue` of the master which posseses the given `Node`, but when only some of a collection of /N/ masters possess a given `Node`, it's not obvious whether to raise an error, use only the given `Node`s, rescaling the interpolating vector (this corresponds to the suggested treatment for two masters), or something else.

2. In [[metapolation]], the assumption is that interpolation vectors have non-negative components that sum to 1, but it's not a necessary mathematical restriction; but the assumption is that we'll enforce it in the interface.