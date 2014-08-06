For explanations of the datatypes, see [[cascading parameter sheets]].

# Principles

The core implementation, as far as possible, doesn't care about the meaning of what it's been asked to do; appropriate constraints on the input and output should be provided by the user interface. Hence:

* No unavoidable errors. For example, ignore nodes that can't be interpolated, interpolation vectors with the wrong number of elements.
* Handle incomplete data (for example, glyphs that occur in one master and not another).
* Handle any algorithmically-valid data, e.g. interpolation vectors that don't sum to 1.
* Signal likely problems, e.g. attempts to interpolate non-interpolable types should be signalled.

# Inputs

An interpolator is a list of rules (supplied as CPS) and a list of _N_ masters.

From the masters' `Parameter` `Registry`s, a new combined `Registry` is inferred, where each interpolable type is replaced by a list of reals. This new `Registry` is used to parse the CPS into a list of `Rule`s.

Each interpolable type has an interpolation operator defined on it (e.g., reals, complex numbers, formulae).

# Algorithm

The interpolator interpolates as follows:

0. The skeletons are checked for compatibility. In future, it may be possible to interpolate them.
1. The `Rule`s are used to query each master, resulting in a `Node` list.
2. The interpolating `Parameter`s are used to interpolate the relevant values of each master. If only some masters contain a particular `Node`, only those are interpolated, using an interpolation vector with just the elements corresponding to the participating masters, with the interpolation coefficients rescaled, so the vector has the same length as the original. In particular, in the typical case of two masters and a vector whose length is 1, this means that the `Node` is simply copied from the master that possesses it.