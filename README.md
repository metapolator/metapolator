Metapolator
==============

Metapolator is a web-based parametric font editor.

It provides a GUI for designing with UFO fonts and Metafont – a language for semi-algorithmic specification of typefaces. Metapolator was created out of the need to create large font families efficiently.

For classical interpolation using multiple masters and axes, Metapolator can load normal UFO fonts (without any modifications) load and save into the UFO format and create new instances on the fly.

To use the full potential of parametrising fonts, Metapolator can parse already existing fonts (such as PostScript Type 1 or OpenType). They need to be broken up into separate shapes resembling strokes and provide consistent counterpoints. In this process, a Metafont is produced by specifying the central skeleton of shapes – for which there are "pens" of different angles and widths along the skeleton. As the glyph shapes are defined through equations, they can be parametrised along axes such as aspect ratio, weight, slant, stroke width, contrast and so on.

Furthermore instead of using prepared fonts it will be possible to enhance normal UFO fonts by adding parameters on request and only parametrise certain parts of a glyph.

Metapolator allows the designer to utilise Metafont without have to write any Metafont code.

## Installation

### Docker

The simple way to install and run metapolator is with [docker.io](http://www.docker.io)

1. [Install Docker](http://www.docker.io/gettingstarted/)
2. `sudo docker build -rm -t metapolator git://github.com/metapolator/docker.git;`
3. `sudo docker run -p 8080 -t metapolator;`

### Traditional Installation

Requirements: 

- [git](http://git-scm.org)
- [Metafont and Metapost](http://www.tug.org/)
- [MySQL](http://dev.mysql.com/downloads/mysql/)
- [Python](http://www.python.org/)
- [python-mysqldb](http://sourceforge.net/projects/mysql-python/)
- [Type 1 utilities](http://www.lcdf.org/type/#t1utils)
- [unzip](http://en.wikipedia.org/wiki/Zip_%28file_format%29)
- [mf2pt1](http://www.ctan.org/tex-archive/support/mf2pt1)
- [FontForge](http://sourceforge.net/projects/fontforge/files/fontforge-source/)
- [web.py](http://webpy.org/)
- Optimized for Google Chrome

#### Ubuntu/Debian

```sh
sudo apt-get install -y unzip git texlive-metapost mysql-client mysql-server libmysqlclient-dev t1utils libffi-dev libevent-dev libxml2-dev libxslt-dev;
# Note your mysql root password
sudo apt-get install -y woff-tools
# TODO: how to install fontforge and fontforge-python from source
# git clone https://github.com/fontforge/fontforge.git;
sudo apt-get install -y fontforge python-fontforge;
sudo apt-get install -y build-essential autoconf libtool python-dev;
sudo apt-get install -y python-virtualenv python-setuptools python-pip;
mkdir ~/src;
cd ~/src;
git clone https://github.com/metapolator/metapolator.git;
cd metapolator;
virtualenv .venv;
source .venv/bin/activate ; pip install -r requirements.txt
```

#### Mac OS X 

```sh
# Install Homebrew
brew install mysql t1utils libffi libevent libxml2 libxslt;
ln -sfv /usr/local/opt/mysql/*.plist ~/Library/LaunchAgents;
launchctl load ~/Library/LaunchAgents/homebrew.mxcl.mysql.plist;
mkdir src;
cd src;
wget http://mirrors.ctan.org/support/mf2pt1.zip;
unzip mf2pt1.zip;
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
easy_install -U distribute pip;
pip install virtualenv;
virtualenv .venv;
source .venv/bin/activate ; pip install -r requirements.txt;
````

### Setup

Create new database:

```sh
mysql --user=root -e "DROP DATABASE metapolatordev; CREATE DATABASE metapolatordev;";
```

Load the preset database:

```sh
.venv/bin/python metapolator/models.py;
```

Start web.py application and celery server:

```sh
.venv/bin/python run.py;
.venv/bin/celery -A metapolator.tasks worker --loglevel=info;
```

This should give you a local web server you can visit with Chrome:

```sh
open [http://0.0.0.0:8080](http://0.0.0.0:8080);
```

### Ubuntu/Debian Server Deployment

Install supervisor and nginx

```
sudo apt-get install nginx
sudo apt-get install supervisor
```

Create symlinks for configuration file. Notice that your project directory is not different from configs

```
sudo ln -s /var/www/webpy-app/metapolator/webapp_configs/supervisor.conf /etc/supervisor/conf.d/metapolator.conf;
sudo ln -s /var/www/webpy-app/metapolator/webapp_configs/nginx.conf /etc/nginx/sites-enabled/metapolator.conf;
```

## License

This project is licensed under the [GNU General Public License v3.0](http://www.gnu.org/copyleft/gpl.html).

## Credits

Core Development Team: Simon Egli, Vitaly Volkov

Contributors: Walter Egli, Nicolas Pauly, Wei Huang, 

Thanks to Dave Crossland for inspiring this project!
