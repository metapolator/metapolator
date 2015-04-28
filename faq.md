# Metapolator FAQ

_To ask new questions, please post a [new Github issue](https://github.com/metapolator/metapolator/issues) or in the [Metapolator G+ Community](https://plus.google.com/communities/110027004108709154749)_

## About The Project 

#### What is Metapolator?

Metapolator is an open web tool for designing fonts and font families quickly.

#### What makes Metapolator different than any other font editor?

Most font editors are not parametric, and those that are require designers to be good with programming to create new parameters.
The biggest difference is that Metapolator enables designers to create parametric type systems entirely visually, with zero coding. 
Yet under the hood, the Metapolator CPS technology offers an elegant new way to code such systems for those who wish to.

#### How do I get started?

Check out the demo at [metapolator.com/purple-pill](http://metapolator.com/purple-pill/) where you can play with a pre-loaded typeface and export UFO fonts at the end to load into your favorite traditional font editor.
We'll post a screencast that demonstrates how to use the tool soon.

#### How can I contribute to the project?﻿

We'd love to hear from you about what you do and don't like about the project.
Introduce yourself in the [Metapolator G+ Community](https://plus.google.com/communities/110027004108709154749) and let us know how you'd like to contribute.
You can also support the project financially by [buying a T shirt](http://teespring.com/metapolator-beta-0-3-0) or sending a donation.

If you'd like to get more involved in our development discussions, you can set Github to email you and you can reply via email too. At [github.com/metapolator/metapolator](http://github.com/metapolator/metapolator) simply set the `Watch` status on:

![Watch Metapolator on Github](http://metapolator.com/images/wiki/watch-us.png) 

#### How do I donate money to the project?

The project technical lead, Lasse Fister, is accepting donations via PayPal at `lasse@graphicore.de`

#### Why is Metapolator open?

We believe in a free and just society.
For designers, that means that users and developers of design tools ought to have political equality in their development.
This is the basis of the [software freedom movement](http://en.wikipedia.org/wiki/Free_software_movement), and has led to famous projects like Wikipedia, Firefox and GNU+Linux.
It naturally leads to us towards public, collaborative and open-ended development of design tools made available under [copyleft licenses](http://en.wikipedia.org/wiki/Copyleft). 
The doors to our studio are open. 
We hope you'll join us.

#### Why is Metapolator a web tool?

The web has inherent advantages as an application platform: 
Every computer can run web tools out of the box, and installation is simply searching for the tool, or typing an address. 
Upgrading is also very simple: developers just push a new version to the web server, and users just refresh the page.
And there are many other similar benefits.

But the primary motivation for the Metapolator team is that User Interfaces made with web technology are the easiest to customize, down to the last detail. 
A lot of designers have great ideas for improving the interfaces of their professional tools, but the best they can do is describe what they want to the tool developers. 
Direct action to participate in the development of the interface is not possible, because designers generally don't learn the programming skills that would be required. 
And all too often, because other editors are written with native app technologies (Qt, Cocoa, etc) the tool developers can not realise the designers suggestions easily.

##### Why is Metapolator written in JavaScript, not Python?

There are some really great libre licensed font editor libraries available in Python (from [@robofab-developers](https://github.com/robofab-developers?tab=repositories), [@typesupply](https://github.com/typesupply?tab=repositories), [@typemytype](https://github.com/typemytype?tab=repositories), and more) that most type designers with an interest in coding are familiar with.
These can be available for those making font editor web apps, by building a server-side engine in Python that is coupled to a web UI, like [NovaCut](https://www.kickstarter.com/projects/novacut/novacut-pro-video-editor/description).

Our initial prototypes in 2013 and early 2014 were made this way, and involved wiring together with Python many different tools in various languages, like [mf2pt1](https://www.ctan.org/pkg/mf2pt1?lang=en) and [fontforge](http://fontforge.org).

But we decided at the Libre Graphics Meeting 2014 at Leipzig in April that the programming language most widely known by designers globally (indeed, everyone) in the next 20 years [will be JavaScript](http://www.quora.com/Which-language-is-going-to-dominate-the-future-of-web-development-JavaScript-PHP-Ruby-Java-Scala-or-Python):

[![Redmonk graph of programming language trends on Github](http://metapolator.com/images/wiki/redmonk-github-languages.png)](http://www.quora.com/Which-language-is-going-to-dominate-the-future-of-web-development-JavaScript-PHP-Ruby-Java-Scala-or-Python)

Lasse Fister had already ported much of RoboFab to JavaScript in [ufoJS](https://github.com/graphicore/ufoJS), including [Pens](http://www.robofab.org/objects/pen.html) and [UFO](http://unifiedfontobject.org/) support, and at that time [OpenType.js](http://nodebox.github.io/opentype.js/) began offering live font compilation. 

So we decided that keeping the system entirely in JavaScript was viable and wouldn't slow us down much compared to the long term benefits.

#### I don’t like uploading my fonts to cloud editors

We share this concern.
Metapolator's code is 100% JavaScript, so it runs entirely in your browser. 

[!["There is no cloud, only other people's computers."](http://metapolator.com/images/wiki/thereisnocloud-v2-preview.png)](https://fsfe.org/contribute/spreadtheword.en.html#nocloud)

In future we plan to offer remote storage features (see issue X) but we will do using the [unhosted.org model](https://unhosted.org), likely with the [remotestorage.io](https://remotestorage.io/integrate/) standard, so that you will keep total control of who's computers your fonts are uploaded to.
We may also offer a 100% local version via [nw.js](https://github.com/nwjs/nw.js/wiki/Tutorials-on-Node-WebKit).
If you have opinions about this, please post your thoughts on this topic in the [Metapolator G+ Community](https://plus.google.com/communities/110027004108709154749).

## Support

#### When I enter my own specimen text, how do I add linebreaks or paragraph breaks?

Use the special codes `*n` for new lines and `*p` for new paragraphs.

#### The user interface says ‘coming soon.’ When is that?

Throughout 2015 and beyond. 
As of April 2015 the project has no major financial support, so the implementation of new features is unpredictable.

#### I need a feature. What should I do?

Post a [new Github issue](https://github.com/metapolator/metapolator/issues) describing what you want.
Mocked up screenshots or screencast videos with a detailed proposal are ideal. 
A narrated screencast video showing the current interface and telling us what you'd like to change is good too.

#### I found a bug. What should I do?

Post a [new Github issue](https://github.com/metapolator/metapolator/issues) with a narrated screencast video showing what is wrong, and describing what you expect. 

## Concepts

#### What is interpolation?

Interpolation is a mathematical term for methods of constructing new data points within a range of known data points.
When [Adobe Multiple Master](http://en.wikipedia.org/wiki/Multiple_master_fonts) fonts were introduced, desktop publishing users could finally use the power of interpolation to generate intermediate weights or styles of typefaces they used, instead of being limited to only those provided by typeface developers.

#### What is a center line?

The Metapolator drawing model supports regular outline contours but can also create outlines from the higher-level abstraction of strokes.
These strokes have a center line contour formed by points that have width and angle properties to create left and right side outline points.
The points also have tension and direction properties for calculating the contours as [Hobby Splines](https://www.google.com/search?q=hobby%20spline). 
Here is an example of a glyph with the center line visible:

![Metapolator Center Line Example](http://metapolator.com/images/wiki/center-line.png)

#### What is Metafont? 

Metafont is parametric typeface design system developed by Dr Donald Knuth at Stanford in the 1980s as part of the TeX project.
It is a programming language and related tools for describing 
A libre web tool for exploring Metafont fonts is available at [www.metaflop.com](http://www.metaflop.com)