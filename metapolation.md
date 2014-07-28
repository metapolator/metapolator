**Me•ta•po•la•tion**: insert an intermediate font instance into a series by calculating it from surrounding known masters.

This page contains the interaction design research into metapolation and design explorations for handling it.

## the math
Luckily the math of metapolation is straightforward. When working with a design space set up by N masters (M1, M2, M3 .. M[N]), then the instance I is a linear combination of masters:

I = a·M1 + b·M2 + c·M3 .. n·M[N]

and the sum of all the factors (a, b, c .. n) equals 100%.

All points of all skeletons are calculated by this formula in the Cartesian plane.

_Example: 3-master metapolation, and a point has in the three masters the coordinates (x,y): (1,2), (2,3) and (3,2). Instance has metapolation 30% M1, 40% M2, 30% M3. Instance coordinate of the point:_<br>
_x = 30%·1 + 40%·2 + 30%·3 = 0.3 + 0.8 + 0.9 = 2_<br>
_y = 30%·2 + 40%·3 + 30%·2 = 0.6 + 1.2 + 0.6 = 2.4_<br>
_Instance coordinate is (2,2.4)_

All parameters are also calculated by the formula above.

_Example: 5-master metapolation, parameter weight for the five masters is 21, 32, 43, 98 and 62. Instance has metapolation 30% M1, 20% M2, 30% M3, 10% M4, 10% M5._<br>
_Instance weight = 30%·21 + 20%·32 + 30%·43 + 10%·98 + 10%·62 = 6.3 + 6.4 + 12.9 + 9.8 + 6.2 = 41.6_

### everything is connected
If we look at how many ratios can be defined between N masters, the number is the sum of 1 + 2 + 3 + .. + N-1, which is ½·N·(N-1).<br>
_Example: for a 4-master metapolation, there are 1 + 2 + 3 = 6 (= ½·4·3) ratios: M1 ↔ M2, M1 ↔ M3, M1 ↔ M4, M2 ↔ M3, M2 ↔ M4, M3 ↔ M4._

### relations are complicated

Looking beyond the simple one–to–one relationship, we can also list the number of possible triangular and ‘quadrophonic’ relationships:

masters | 1–to–1 | triangles | quads
--- | --: | --: | --:
2 | 1 | - | -
3 | 3 | 1 | -
4 | 6 | 4 | 1
5 | 10 | 10 | 5
6 | 15 | 20 | 15
7 | 21 | 35 | 35
8 | 28 | 56 | 70
9 | 36 | 84 | 126
10 | 45 | 120 | 210

Note that these are the maximum number of relations that can be defined.

### conclusions from the math

The fist conclusion is that for an N-master metapolation only N-1 factors (think: input sliders) are needed; the final factor can be calculated from the 100% rule above. N-1 is the **minimum number** of inputs a metapolation needs. When a master is added to a metapolation, this number increases by 1.

The second conclusion is that for an N-master metapolation at most ½·N·(N-1) factors are needed; the relationship between each master to every other master is defined. ½·N·(N-1) is the **maximum number** of inputs a metapolation needs. When a master is added to an N-master metapolation, this number increases by N.

The conclusion from these conclusions is that the minimum number of inputs grows nice and linear with N _(7-master metapolation: 6 inputs)_, while the maximum number grows quadratic, which quickly adds up _(7-master metapolation: 21 inputs)_.

Although one could say that for simplicity sake striving for a minimum number of inputs is desirable, it can also be said that the maximum number of inputs is a true representation of the complexity of the design space.

## design requirements for metapolation interaction

> RT: Merge with/refer to [[interaction design goals|interaction-design-goals]]?

1. scale to any number of masters; cpu power and user ambition set the limits;
* support exploration: free ‘wandering’ through the design space;
* support ‘reduce the amount of master 2, while all else stays equal’;
* support ‘change the ratio of master 2 and 3, while all else stays equal’;
* support precise input of factors;
* support fine-tuning of factors;
* compatible with 2-D output (screen) and 2-D input (mouse or trackpad);
* be straightforward; no mental energy shall be waisted on decoding the interaction;
* depict the 100% rule ([see math](https://github.com/metapolator/metapolator/wiki/metapolation#the-math)); when master 2 is increased by X percentage point, there is X percent less to divide between all other masters.

## exploration of possible interaction

### string of pearls
![](http://metapolator.com/images/wiki/string.png)

Show here in a cheerful way, this interaction allows to set the ratio between adjacent masters. With N-1 inputs for N masters, it _has_ the minimum number of inputs; the math predicts that the factors of all masters can be calculated.

This interaction is straightforward to spec and build (‘half an hour each’ ;^), looks simple because of
the minimum number of input and the linear structure. But it is not _that_ straightforward for many user tasks and there is no sense of design space at all.

It is obvious how the string is extended when a master is added.

#### the score
1. ✓ scale to any number of masters;
* ✗ support exploration;
* ✗ support ‘reduce the amount of master 2…’;
* ~ support ‘change the ratio of master 2 and 3…’;
* ✗ support precise input of factors;
* ~ support fine-tuning of factors;
* ✓ compatible with 2-D output and input;
* ~ be straightforward;
* ✗ depict the 100% rule.

### gearbox
![](http://metapolator.com/images/wiki/gear.png)

Instead of a string of pearls, this is a string of A ↔ B ratio-setters. It shares the pros and cons of the string of pearls, although it now supports setting the ratios between pairs of masters.

#### extending
When one master is added, the gearbox looks as follows:

![](http://metapolator.com/images/wiki/gearplus.png)

It is obvious how the string is extended when M8 is added.

### mixer
![](http://metapolator.com/images/wiki/mixer.png)

Inspired by mixing consoles used in music production, this interaction simply sets the factor of each master. It has N inputs for N masters, so it is just one up from the minimum number of inputs.

Also can be specced and built in ‘half an hour.’ With this interaction it is very simple to set and see how much of each master is ‘in the mix.’ But other tasks are not so simple, like changing ratios between 2 or 3 masters, and again there is no sense of design space. Beyond that, the behaviour of the mixer gets really funky—because of the 100% rule—when either all of the ‘faders’ are set to zero, or only one fader is non-zero.

It is obvious how the mixer is extended when a master is added.

#### the score
1. ✓ scale to any number of masters;
* ✗ support exploration;
* ✓ support ‘reduce the amount of master 2…’;
* ✗ support ‘change the ratio of master 2 and 3…’;
* ✗ support precise input of factors;
* ~ support fine-tuning of factors;
* ✓ compatible with 2-D output and input;
* ~ be straightforward;
* ✗ depict the 100% rule.

### double-breasted mixer
![](http://metapolator.com/images/wiki/double.png)

Thus named by David Crossland, this is a straight implementation of the maximum number of inputs a metapolation needs; the ratio between each master to every other master. From the math it can be expected that when the slider between Mx and My is changed by users, _all_ other sliders involving Mx and My will also have to move by themselves.

Also can be specced and built in ‘half an hour.’ This is of course the champion in setting the ratio between pairs of masters. But comparing the 6-master setup above to the mixer, it is clear that double-breasted approach gets overwhelming when the number of masters rises (from N > 4, I’d say).

When a master is added to N-master double-breasted, it needs to be extended by N more inputs.

#### the score
1. ✗ scale to any number of masters;
* ✗ support exploration;
* ✗ support ‘reduce the amount of master 2…’;
* ✓ support ‘change the ratio of master 2 and 3…’;
* ✗ support precise input of factors;
* ~ support fine-tuning of factors;
* ✓ compatible with 2-D output and input;
* ~ be straightforward;
* ✗ depict the 100% rule.

### loaded mixer

![](http://metapolator.com/images/wiki/mixer-loaded.png)

DRAFT: _Thinking back to the origins of the project - a type designer draws a single style typeface and now wants to turn it into a family of weights, widths, optical sizes, serifs/sanses, etc.... Perhaps that single initially imported master (M1) can be placed as the origin/center of the design space, and all other masters are interpolated with it. This makes a mixer like this, which solves the 100% rule because if all the sliders are at 0, then the current instance is equal to the M1 master... Manuel von Gebhardi  proposed this [during the brainstorm](https://plus.google.com/103003807659334841389/posts/Bgdb8DWFY5C﻿)_

### the lone triangle
![](http://metapolator.com/images/wiki/triangle.png)

Although it only works for a 3-master setup, the lone triangle has got a lot going for it. First of all: here is a representation of a design space (!); then, users can wander around (!) using the single control; last: the 100% rule is shown (!) (the more one moves to one of the masters, the less wiggle room there is for the other two).

But yeah, any number of masters as long as it is three.

The lone triangle can easily be enhanced to do A ↔ B ratios:

![](http://metapolator.com/images/wiki/triangleAB.png)

#### the score _(enhanced version)_
1. ✗ scale to any number of masters;
* ✓ support exploration;
* ✗ support ‘reduce the amount of master 2…’;
* ✓ support ‘change the ratio of master 2 and 3…’;
* ✗ support precise input of factors;
* ~ support fine-tuning of factors;
* ✓ compatible with 2-D output and input;
* ✓ be straightforward;
* ✓ depict the 100% rule.

### the Noordzij cube
![](http://metapolator.com/images/wiki/Noordzij.png)

The Noordzij cube is a 4-master setup. Studying it shows us that an N-master setup is a N-1-dimensional space (one master in the origin, the other N-1 set up an axis each). It also becomes clear how difficult it is for users to interpret and control M-dimensional spaces (M > 2) in a 2-D medium (the screen).

We can enhance the Noordzij cube for better interpretation and control:

![](http://metapolator.com/images/wiki/Noordzij2D.png)

What we have done is swap out one 3-D interaction for three 2-D interactions, which are coupled through the inherent redundancy (i.e. because each of the 3 dimensions is mapped to 2 input knobs, when one knob is moved one or both others do too).

And also this can easily be enhanced to do A ↔ B ratios:

![](http://metapolator.com/images/wiki/NoordzijAB.png)

#### the score _(AB-enhanced version)_
1. ✗ scale to any number of masters;
* ✓ support exploration;
* ✗ support ‘reduce the amount of master 2…’;
* ✓ support ‘change the ratio of master 2 and 3…’;
* ✗ support precise input of factors;
* ~ support fine-tuning of factors;
* ✓ compatible with 2-D output and input;
* ~ be straightforward;
* ✗ depict the 100% rule.

_ps:_ a Noordzij that implements the 100% rule is a [tetrahedron](http://en.wikipedia.org/wiki/Tetrahedron):

![](http://metapolator.com/images/wiki/tetrahedron.png)

### minimum ratio
![](http://metapolator.com/images/wiki/minimuma.png)

This takes the [double-breasted](https://github.com/metapolator/metapolator/wiki/metapolation#double-breasted) interaction a step forward, or rather, reduces it to manageable proportions. Observing from [the math](https://github.com/metapolator/metapolator/wiki/metapolation#the-math) that N-1 inputs will always be _just_ enough for an N-master setup, we do exactly that: show N-1 sliders (5 here, for a 6-master setup) and ensure that there are no duplicates. Compared the the example show at [double-breasted](https://github.com/metapolator/metapolator/wiki/metapolation#double-breasted) we see that for the same number of masters there is a lot less, well, stuff.

The left-and right-hand side of the sliders are configurable; they can be set to anything users like—as long as there are no duplicate sliders, or ones that go from Mx to Mx; the selection available in the pop-up lists will prevent that from happening. Any combination works _(says the math)_:

![](http://metapolator.com/images/wiki/minimumAlta.png)

When a left-or right-hand side of a slider is changed, the slider value is adapted to show the current state of metapolation.

Also the left-hand side of the sliders can be ‘From zero’, which turns the slider into a fader as seen on [the mixer](https://github.com/metapolator/metapolator/wiki/metapolation#mixer):

![](http://metapolator.com/images/wiki/minimumZeroa.png)

Remarkably, the funky behaviour of the mixer when setting faders to zero disappears here, because there is one input less and the 100% rule is kept occupied providing N equations for N unknowns, instead of being redundant and making mischief.

We can add a little convenience:

![](http://metapolator.com/images/wiki/minimumAlla.png)

The ‘all’ popup sets the complete left-hand side to the same master, while setting the right-hand side to all remaining masters, in ascending order. Here M3 hes been set:

![](http://metapolator.com/images/wiki/minimumAllM3.png)

It can also set the left-hand side to ‘From zero’ and the right-hand side to M1–M<sub>N-1</sub>, in ascending order (gotta make a choice to leave one out and this one makes it easy enough to change one slider to M<sub>N</sub> if so desired by users).

When a master is added to the setup, minimum ratio is extended by one slider.

#### the score
1. ✓ scale to any number of masters;
* ✗ support exploration;
* ✓ support ‘reduce the amount of master 2…’;
* ✓ support ‘change the ratio of master 2 and 3…’;
* ✗ support precise input of factors;
* ✓ support fine-tuning of factors;
* ✓ compatible with 2-D output and input;
* ✓ be straightforward;
* ✗ depict the 100% rule.

### rubber space
![](http://metapolator.com/images/wiki/rubber.png)

This is a flexible design space (light grey), set up by any number of masters (here: 5). Each master can be seen as a force field, influencing the space. The white star in the centre defines the equilibrium point: all masters are there at equal strength (here: 20%). The cursor (dark grey) is used to wander around, explore the space and define an instance.

This is an impression of the force field of master M4 (black = 100%, white is 0%):

![](http://metapolator.com/images/wiki/rubberForce.png)

Note that is was built completely out of 5 triangles, each with corners at the equilibrium point and 2 masters.The whole field is defined by the expected results that M4 = 100%, M1–M3 & M5 = 0%; equilibrium point = 20%; half-way M4–M3 & half-way M4–M5 = 50% (i.e. exactly on the perimeter, to the two nearest neighbours).

Users can configure the space however they feel is correct for their masters. Any master can be positioned anywhere within the square perimeter. Basic guidance is
* the further away a master is from the equilibrium point, the more far-out it is;
* position closely related masters closer together.

_(maybe, just maybe, Metapolator will be able to calculate a useful default setup from these rules, instead of the clockwise-on-a-circle default shown above)_

The equilibrium point is always positioned at the [centroid](http://en.wikipedia.org/wiki/Centroid) of the polygon; “informally, the point at which a cardboard cut-out of the region could be perfectly balanced on the tip of a pencil.” The formula to calculate the centroid can be found [here](http://en.wikipedia.org/wiki/Centroid#Centroid_of_polygon).

Users are free to completely ignore this guidance and go wild.

Here is a possible user setup:

![](http://metapolator.com/images/wiki/rubberUsera.png)

It expresses that M1–M2 is the main axis of metapolation, M3 is a far-out master related to M1, M5 is related to M2 and M4 is a subtle variant that is half-way house between M1 and M2. This also shows that masters can be reordered on the perimeter of the design space: just drag a master over the line connecting two other masters.

**note**: rearranging the masters only changes the design space arrangement, it does not change the masters themselves.

It is obvious how rubber space is extended when a master is added.

#### the score
1. ✓ scale to any number of masters;
* ✓ support exploration;
* ✗ support ‘reduce the amount of master 2…’;
* ~ support ‘change the ratio of master 2 and 3…’;
* ✗ support precise input of factors;
* ~ support fine-tuning of factors;
* ✓ compatible with 2-D output and input;
* ✓ be straightforward;
* ✓ depict the 100% rule.