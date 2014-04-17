Metapolator
==============

[![Build Status](https://drone.io/github.com/metapolator/metapolator/status.png)](https://drone.io/github.com/metapolator/metapolator/latest)

## Introduction

Metapolator is a web-based parametric font editor.

It provides a GUI for designing with UFO fonts and Metafont – a language for semi-algorithmic specification of typefaces. Metapolator was created out of the need to create large font families efficiently.

For classical interpolation using multiple masters and axes, Metapolator can load normal UFO fonts (without any modifications) load and save into the UFO format and create new instances on the fly.

To use the full potential of parametrising fonts, Metapolator can parse already existing fonts (such as PostScript Type 1 or OpenType). They need to be broken up into separate shapes resembling strokes and provide consistent counterpoints. In this process, a Metafont is produced by specifying the central skeleton of shapes – for which there are "pens" of different angles and widths along the skeleton. As the glyph shapes are defined through equations, they can be parametrised along axes such as aspect ratio, weight, slant, stroke width, contrast and so on.

Furthermore instead of using prepared fonts it will be possible to enhance normal UFO fonts by adding parameters on request and only parametrise certain parts of a glyph.

Metapolator allows the designer to utilise Metafont without have to write any Metafont code.

## Product Vision

_Our ['Product Vision'](http://www.mmiworks.net/wedo/product.html) defines and guides Metapolator's development, and was written by Peter Sikking in April 2014 Following a discussion with the developers ([video](http://www.youtube.com/watch?v=mJH6fNCv1Fs))_

Metapolator is an open web tool for making many fonts. It supports working in a font design space, instead of one glyph, one face, at a time.

With Metapolator, ‘pro’ font designers are able to create and edit fonts and font families much faster, with inherent consistency. They gain unique exploration possibilities and the tools to quickly adapt typefaces to different media and domains of use.

With Metapolator, typographers gain the possibility to change existing fonts—or even create new ones—to their needs.

Metapolator is extendible through plugins and custom specimens. It contains all the tools and fine control that designers need to finish a font.﻿

## Tutorial

A now-obsolete tutorial is at http://metapolator.com/tutorial.html

## Terminology

Superness? Overshoot? Instance? We're describing the terminology below to shed some light onto some frequently used terms.

### Metapolator

A wordplay referring to Erik van Blokland's [Superpolator](http://superpolator.com/) and Pablo Impallari's [Simplepolator](http://www.impallari.com/projects/overview/simplepolator) interpolation font tools, and the font programming language [Metafont](http://en.wikipedia.org/wiki/Metafont)

### UFO

[Unified Font Object](http://unifiedfontobject.org/) font format for font-application interchange, used for loading and saving fonts in Metapolator.

### Master

A Master can be compared and interpolated with another Master along an axis.

### Axis

Distance between two masters, for example between `A` and `B`: `A ----- B`

### Instance

A new font created at a certain position on an axis, or between multiple axes.

### Point

![
](https://raw.github.com/metapolator/metapolator/gh-pages/images/curve.png)

Depending on the nature of a [point](http://unifiedfontobject.org/versions/ufo1/glif.html), we can have a control-in and / or a control-out point. The direction of a path defines wheter its an 'in' or 'out' point. In this example we have a curve point (orange) with a control-in (red) and control-out (green) point. The arrow indicates the curve direction.
In the UFO its writen like this:

```
<point x="340" y="65"/>
<point x="340" y="184" type="curve"/>
<point x="340" y="295"/>
```

### Parameters

A parameter is a characteristic, feature, or measurable factor that can help in defining a particular system. We use parameters on various levels to define fonts: `Global parameters` are on a font level, for example `font size`. `Glyph parameters` are on a glyph level, for example `glyph width`. `Point parameters` are on a point and curve level of a glyph shape, for example the position or `coordinate` of a point.

### Z-Point
Point in a two dimensional cartesian coordinate system, defined by x and y coordinates:
`z=(x,y)`


## How It Works

```
ufo fonts -input-to-> xml2mf.py =outputs=>
mf files -> metapost.c =>
mf files -> mf2pt1.pl =>
pfb fonts -> fontforge.c =>
ufo + otf fonts
```

Metapolator is built with many libre software components:

- [Chromium Canary](http://www.chromium.org/getting-involved/dev-channel) or [Firefox Aurora](http://www.mozilla.org/en-US/firefox/aurora/) to run the UI
- [git](http://git-scm.org) to manage the code
- [web.py](http://webpy.org/) to run the webserver
- [unzip](http://en.wikipedia.org/wiki/Zip_%28file_format%29) to unzip the `ufo.zip`s
- [python](http://www.python.org/) to metapolate (convert) the `ufo`s into `metafont`s
- [mysql](http://dev.mysql.com/downloads/mysql/) (and [python-mysqldb](http://sourceforge.net/projects/mysql-python/)) to store the parameters (TODO: Confirm this with Simon)
- [metapost](http://www.tug.org/) to apply parameters to metafonts
- [mf2pt1](http://www.ctan.org/tex-archive/support/mf2pt1) (and [Type 1 utilities](http://www.lcdf.org/type/#t1utils)) to convert the metafont back into a Type 1 font
- [FontForge](http://sourceforge.net/projects/fontforge/files/fontforge-source/) to convert the Type 1 font to UFO and OTF


## Roadmap

### Command Line interface

https://github.com/metapolator/metapolator/issues/46

## Installation

### Ubuntu/Debian

#### The Simple Way

The simple way to install and run metapolator is with [docker](http://www.docker.io):

1. [Install Docker](http://www.docker.io/gettingstarted/)
2. `sudo docker pull metapolator/metapolator` # download metapolator
3. `sudo docker run -p 8080:8080 -t metapolator/metapolator`# run metapolator
4. `chromium-browser http://localhost:8080` # use metapolator

#### The Traditional Way

```sh
mkdir ~/src;
cd ~/src;
# Install system dependencies
sudo apt-get install -y build-essential autoconf libtool python-dev python-virtualenv python-setuptools python-pip unzip git texlive-metapost mysql-client mysql-server libmysqlclient-dev t1utils libffi-dev libevent-dev libxml2-dev libxslt-dev woff-tools chromium-browser;
# During the install process of mysql, note your root password

# Install fontforge from git master (When someone makes a new release of fontforge and someone packages it for Debian, then you can do "sudo apt-get install -y fontforge python-fontforge;") 

# install metapolator
git clone https://github.com/metapolator/metapolator.git;
cd metapolator;
make install;
make setup;
make run;
```
Chromium should open <http://localhost:8080>

### Mac OS X

#### The Simple Way

TODO: Describe how to run metapolator with [docker](http://www.docker.io) on Mac OS X. If you do this, please update this copy of your `~/src/metapolator/README.md` and send us a pull request :)

#### The Traditional Way

First, install [Homebrew](http://brew.sh) and [Chromium Canary](http://www.chromium.org/getting-involved/dev-channel)

```sh
mkdir src;
cd src;

# Install system dependencies
brew install mysql t1utils libffi libevent libxml2 libxslt autoconf automake libtool python;
# Run mysql on startup after reboot
ln -sfv /usr/local/opt/mysql/*.plist ~/Library/LaunchAgents;
# Run mysql now
launchctl load ~/Library/LaunchAgents/homebrew.mxcl.mysql.plist;

# Install fontforge from git master
brew install fontforge --with-x --HEAD;

# install sfnt2woff HEAD. TODO: make a homebrew package for this
mkdir sfnt2woff;
cd sfnt2woff;
wget http://people.mozilla.org/~jkew/woff/woff-code-latest.zip;
unzip woff-code-latest.zip;
make;
sudo cp sfnt2woff /usr/local/bin/;
cd ..;

# install metapolator
git clone https://github.com/metapolator/metapolator.git;
cd metapolator;
make install;
make setup;
make run;
````
Chromium should open <http://localhost:8080>

## Deployment

#### The Simple Way

Deploy metapolator to your own server easily with [drone.io](https://drone.io/)

Check out <https://drone.io/github.com/metapolator/metapolator> to see how we continuously deploy the official metapolator master branch to <http://beta.metapolator.com>

### The Traditional Way

To deploy metapolator on a Ubuntu or Debian server with nginx:

```sh
# Install supervisor and nginx
sudo apt-get install supervisor nginx
# Create symlinks for configuration file. Notice if your project directory is different from configs
sudo ln -s /var/www/webpy-app/metapolator/webapp_configs/supervisor.conf /etc/supervisor/conf.d/metapolator.conf;
sudo ln -s /var/www/webpy-app/metapolator/webapp_configs/nginx.conf /etc/nginx/sites-enabled/metapolator.conf;
```

## Contributing

### License

This project is licensed under the [GNU General Public License v3.0](http://www.gnu.org/copyleft/gpl.html) and your contributions are welcome via Github at <https://github.com/metapolator/metapolator>

### Front End

HTML templates are in [`/templates`](https://github.com/metapolator/metapolator/tree/master/templates) using [web.py's native template system](http://webpy.org/docs/0.3/templetor).

JS and CSS are in [`/static`](https://github.com/metapolator/metapolator/tree/master/static/js)

We don't use CoffeeScript because it [makes code harder to read](ceronman.com/2012/09/17/coffeescript-less-typing-bad-readability/) and the [scoping is global](https://donatstudios.com/CoffeeScript-Madness).

## Back End

TODO: Add Code review youtube video link

We use JSON a lot, so you might like to install [JSONview](https://addons.mozilla.org/en-US/firefox/addon/jsonview/) for Firefox or [JSONviewer](https://chrome.google.com/webstore/detail/json-viewer/gbmdgpbipfallnflgajpaliibnhdgobh/related) for Chromium.

## Thanks

Core Development Team: Simon Egli, Lasse Fister, Alex Troush

Contributors: Vitaly Volkov, Walter Egli, Nicolas Pauly, Wei Huang, you?

Thanks to the [metaflop](http://www.metaflop.com) team and Dave Crossland for leading to this project!

## Related Projects

### For Users

* http://metaflop.com libre parametric font editor web app
* http://prototypo.io libre parametric font editor web app
* http://glyphrstudio.com outline font editor web app
* http://fontark.net outline font editor web app, proprietary
* http://fontforge.github.io outline font editor desktop app
* http://mondrian.io outline illustration web app
* https://code.google.com/p/svg-edit/ outline illustration web app
* http://popcornjs.org video editor web app
* http://plucked.de audio editor web app

### For Developers

* http://en.wikipedia.org/wiki/MetaFont parametric font system
* http://en.wikipedia.org/wiki/MetaPost parametric drawing system
* http://fontforge.org/python.html font editor Python module
* http://github.com/behdad/fonttools Python library and command line tool for font binaries: reading, writing, subsetting with OpenType feature support 
* http://nodebox.github.io/opentype.js JS library for reading font binaries
* https://github.com/ynakajima/ttf.js JS library for reading font binaries
* https://github.com/bramstein/opentype JS library for reading font binaries
* https://github.com/Pomax/A-binary-parser-generator/ JS library for reading arbitrary binaries given a spec file
* https://github.com/graphicore/ufoJS JS library for reading font sources and rendering them on canvas
* http://paperjs.org JS library for canvas drawing from Switzerland
* http://jonobr1.github.io/two.js JS library for canvas drawing from Google
* http://www.createjs.com/#!/EaselJS JS library for canvas drawing from Adobe
* http://snapsvg.io/ useful SVG library from Adobe
