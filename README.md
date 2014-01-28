Metapolator
==============

Please refer to this [short introduction](http://metapolator.com/about) until the new version is ready.

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


## Installation

### Ubuntu or Debian

```sh
$ sudo apt-get install -y unzip git texlive-metapost mysql-client mysql-server libmysqlclient-dev t1utils libffi-dev libevent-dev libxml2-dev libxslt-dev;
# Note your mysql root password
$ sudo apt-get install -y woff-tools
$ sudo apt-get install -y fontforge python-fontforge;
$ sudo apt-get install -y build-essential autoconf libtool python-dev;
$ sudo apt-get install -y python-virtualenv python-setuptools python-pip
$ git clone https://github.com/metapolator/metapolator.git;
$ cd metapolator;
$ virtualenv .venv;
$ source .venv/bin/activate ; pip install -r requirements.txt
```

### Mac OS X 

```sh
# Install Homebrew
$ brew install mysql t1utils libffi libevent libxml2 libxslt;
$ ln -sfv /usr/local/opt/mysql/*.plist ~/Library/LaunchAgents
$ launchctl load ~/Library/LaunchAgents/homebrew.mxcl.mysql.plist
$ mkdir src;
$ cd src;
$ wget http://mirrors.ctan.org/support/mf2pt1.zip;
$ unzip mf2pt1.zip;
$ mkdir sfnt2woff;
$ cd sfnt2woff;
$ wget http://people.mozilla.org/~jkew/woff/woff-code-latest.zip;
$ unzip woff-code-latest.zip;
$ make;
$ sudo cp sfnt2woff /usr/local/bin/;
$ cd ..;
$ brew install autoconf automake libtool python;
$ brew install fontforge --with-x --HEAD;
$ git clone https://github.com/metapolator/metapolator.git;
$ cd metapolator;
$ easy_install -U distribute pip;
$ pip install virtualenv;
$ virtualenv .venv;
$ source .venv/bin/activate ; pip install -r requirements.txt
````

Login to your mysql database as root. You could also change these settings on line 6 in model.py.

```
$ mysql -uroot -p
```

Create new database:

```
mysql> CREATE DATABASE metapolatordev;
```

Load the preset database:

```
$ .venv/bin/python metapolator/models.py
```

Start web.py application:

```
$ .venv/bin/python run.py
```

This should give you a local web server you can visit with Chrome:

```
[http://0.0.0.0:8080/](http://0.0.0.0:8080/)
```

Start celery server

```
$ .venv/bin/celery -A metapolator.tasks worker --loglevel=info
```

### Deployment

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

## Docker instruction

```
$ docker pull  metapolator/docker

```

## License

This project is licensed under the [GNU General Public License v3.0](http://www.gnu.org/copyleft/gpl.html).

## Credits

Authors: Simon Egli, Vitaly Volkov

Contributors: Walter Egli, Nicolas Pauly, Wei Huang

Thanks to Dave Crossland for inspiring this project!
