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
$ sudo apt-get install -y build-essential autoconf libtool python-dev;
# TODO: how to install fontforge and fontforge-python from source
# git clone https://github.com/fontforge/fontforge.git;
$ sudo apt-get install -y fontforge python-fontforge;
$ git clone https://github.com/metapolator/metapolator.git;
$ cd metapolator;
$ easy_install -U distribute pip;
$ sudo apt-get install -y python-virtualenv;
$ virtualenv .venv;
$ source .venv/bin/activate ; pip install -r requirements.txt
```

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

## License

This project is licensed under the [GNU General Public License v3.0](http://www.gnu.org/copyleft/gpl.html).

## Credits

Authors: Simon Egli, Vitaly Volkov

Contributors: Walter Egli, Nicolas Pauly, Wei Huang

Thanks to Dave Crossland for inspiring this project!