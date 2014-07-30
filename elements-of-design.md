## overall structure

Let’s develop an overall structure for the user interaction; a global plan for where everything in Metapolator ‘lives’. All the functionality we have to pack, even for v1.0, does not fit on one screen; different departments need to be created. But we also want to create a sense of continuity for users, not just a collection of screens and panels.

We can observe the following:

* the **masters** form the connection between the world of skeletons & parameters, and the design spaces.
* the **instances** form the connection between the design spaces and real font (families).
* the two statements above have in common the **design spaces**, they connect masters to instances.

With these three connecting elements, we can chain four departments together, their working titles are:

1. Parameters
* Design Spaces
* Metapolation
* Fonts

![](http://mmiworks.net/metapolator/trainof4.png)

Giving everything its place is looks like this:

![](http://mmiworks.net/metapolator/refined6.png)

**notes**, from left to right:

* **parameters** is where the cascading parameter system is displayed and edited (driven by context of the next section); here also the global, project parameters can be found (always, heh);
* **character range or specimens** are set up here and form the working context for editing a whole master, a glyph (range), point(s), lines(s), or vector shape(s)—all via the parameter section or via direct manipulation here.
* **masters and adjustment masters** are managed here and drive either the character range or specimens section or are input to the next two sections.
* **(adjustment) master sequences**, are managed here.
* **design spaces** set up here from the master side; worked in from the instance side; in the lower half **character range or specimens** can be evaluated, deeding on the master(s) or instance(s) highlighted.
* **metapolation sliders** supplement the more visual and explorative design spaces with precise input (see [minimum ratio](https://github.com/metapolator/metapolator/wiki/metapolation#minimum-ratio)).
* **(strings of) instances** are managed here.
* **font (family) mapping** is managed here, large-scale font export takes place from here.
* **metadata** is maintained and assigned here to the font (families).
* beyond this, in the future kerning and hinting will also find a home at this side of this tableau.

Driven by the choice of department (Parameters, Design Spaces, Metapolation, Fonts) the viewport slides left or right, showing the continuity between these departments:

![](http://mmiworks.net/metapolator/slide5.png)

_(yes, for R-to-L language UI localisation, the whole order of these sections needs to be reversed, because its sequence is a forward/backward order in reading direction)_

The individual department views, Parameters:

![](http://mmiworks.net/metapolator/paraview.png)

Design Spaces:

![](http://mmiworks.net/metapolator/designview2.png)

Metapolation:

![](http://mmiworks.net/metapolator/metapolview2.png)

Fonts:

![](http://mmiworks.net/metapolator/fontsview.png)

**quick note**: it will not be required to set up and navigate to the Fonts section to get a font out of Metapolator—for a quick try-out there will be quicky font export available for individual masters and instances (& co).