Metapolator
==============

## Introduction

Metapolator is a web-based parametric font editor.

It provides a GUI for designing with UFO fonts and Metafont – a language for semi-algorithmic specification of typefaces. Metapolator was created out of the need to create large font families efficiently.

For classical interpolation using multiple masters and axes, Metapolator can load normal UFO fonts (without any modifications) load and save into the UFO format and create new instances on the fly.

To use the full potential of parametrising fonts, Metapolator can parse already existing fonts (such as PostScript Type 1 or OpenType). They need to be broken up into separate shapes resembling strokes and provide consistent counterpoints. In this process, a Metafont is produced by specifying the central skeleton of shapes – for which there are "pens" of different angles and widths along the skeleton. As the glyph shapes are defined through equations, they can be parametrised along axes such as aspect ratio, weight, slant, stroke width, contrast and so on.

Furthermore instead of using prepared fonts it will be possible to enhance normal UFO fonts by adding parameters on request and only parametrise certain parts of a glyph.

Metapolator allows the designer to utilise Metafont without have to write any Metafont code.

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

###



## Installation

### Ubuntu/Debian

#### The Simple Way

The simple way to install and run metapolator is with [docker.io](http://www.docker.io)

1. [Install Docker](http://www.docker.io/gettingstarted/), perhaps with [HomeBrew](http://brew.sh): `brew install docker`
2. `sudo docker pull metapolator/metapolator`
3. `sudo docker run -p 80:8080 -t metapolator/metapolator`
4. open in browser `http://localhost`

#### The Traditional Way

```sh
sudo apt-get install -y unzip git texlive-metapost mysql-client mysql-server libmysqlclient-dev t1utils libffi-dev libevent-dev libxml2-dev libxslt-dev;
# Note your mysql root password
sudo apt-get install -y woff-tools
# install fontforge and fontforge-python from source
# git clone https://github.com/fontforge/fontforge.git;
#
sudo apt-get install -y fontforge python-fontforge;
sudo apt-get install -y build-essential autoconf libtool python-dev;
sudo apt-get install -y python-virtualenv python-setuptools python-pip;
mkdir ~/src;
cd ~/src;
git clone https://github.com/metapolator/metapolator.git;
cd metapolator;
make install;
make setup;
make run;
```

### Mac OS X

#### The Simple Way

The simple way to install and run metapolator is with [docker.io](http://www.docker.io)

1. [Install Docker](http://www.docker.io/gettingstarted/)
2. `sudo docker pull metapolator/metapolator`
3. `sudo docker run -p 9000:8080 -t metapolator/metapolator`
4. open in browser `http://localhost:9000`

#### The Traditional Way

```sh
# Install Homebrew
brew install mysql t1utils libffi libevent libxml2 libxslt;
ln -sfv /usr/local/opt/mysql/*.plist ~/Library/LaunchAgents;
launchctl load ~/Library/LaunchAgents/homebrew.mxcl.mysql.plist;
mkdir src;
cd src;
mkdir sfnt2woff;
cd sfnt2woff;
wget http://people.mozilla.org/~jkew/woff/woff-code-latest.zip;
unzip woff-code-latest.zip;
make;
sudo cp sfnt2woff /usr/local/bin/;
cd ..;
brew install autoconf automake libtool python;
brew install fontforge --with-x --HEAD;
git clone https://github.com/metapolator/metapolator.git;
cd metapolator;
make install;
make setup;
make run;
````

###

This should give you a local web server you can visit with a modern web browser: [http://0.0.0.0:8080](http://0.0.0.0:8080)


## Deployment

#### The Simple Way

Deploy metapolator to your own server easily with [drone.io](https://drone.io/)

Check out <https://drone.io/github.com/metapolator/metapolator> to see how we continuously deploy the central metapolator master to <http://beta.metapolator.com>

### The Traditional Way

To deploy metapolator on a Ubuntu or Debian server...

Install supervisor and nginx

```
sudo apt-get install supervisor nginx
```

Create symlinks for configuration file. Notice that your project directory is not different from configs

```
sudo ln -s /var/www/webpy-app/metapolator/webapp_configs/supervisor.conf /etc/supervisor/conf.d/metapolator.conf;
sudo ln -s /var/www/webpy-app/metapolator/webapp_configs/nginx.conf /etc/nginx/sites-enabled/metapolator.conf;
```

## Contributing

### License

This project is licensed under the [GNU General Public License v3.0](http://www.gnu.org/copyleft/gpl.html) and your contributions are welcome via Github at <https://github.com/metapolator/metapolator>

### Front End

HTML templates are in [`/templates`](https://github.com/metapolator/metapolator/tree/master/templates) using [web.py's native template system](http://webpy.org/docs/0.3/templetor).

JS and CSS are in [`/static`](https://github.com/metapolator/metapolator/tree/master/static/js)

## Back End

TODO: Add Code review youtube video link

## Thanks

Core Development Team: Simon Egli, Dave Crossland, Vitaly Volkov, Alex Troush

Contributors: Walter Egli, Nicolas Pauly, Wei Huang,

Thanks to the [metaflop](http://www.metaflop.com) project and Dave Crossland for inspiring this one!

## Related Projects

### For Users

* http://fontforge.github.io impressive font editor
* http://mondrian.io impressive illustration tool
* https://code.google.com/p/svg-edit/ impressive drawing tool
* http://popcornjs.org impressive video editor
* http://plucked.de impressive audio editor

### For Developers

* http://en.wikipedia.org/wiki/MetaFont impressive parametric font system
* http://en.wikipedia.org/wiki/MetaPost impressive parametric graphics system
* http://fontforge.org/python.html impressive font editor Python module
* http://github.com/behdad/fonttools impressive font binary Python module
* http://nodebox.github.io/opentype.js useful canvas library for displaying fonts
* http://paperjs.org useful canvas library
* http://jonobr1.github.io/two.js useful canvas library
* http://www.createjs.com/#!/EaselJS useful canvas library from Adobe
* http://snapsvg.io/ useful SVG library from Adobe
