##About

Please refer to this [short introduction](http://metapolator.com/about) until the online version is ready.

Requirements
- [Metafont and Metapost](http://www.tug.org/)
- [MySQL](http://dev.mysql.com/downloads/mysql/)
- [Python](http://www.python.org/)
- [python-mysqldb](http://sourceforge.net/projects/mysql-python/)
- [web.py](http://webpy.org/)
- [FontForge](http://sourceforge.net/projects/fontforge/files/fontforge-source/)
- [mf2pt1](http://www.ctan.org/tex-archive/support/mf2pt1)
- [Type 1 utilities](http://www.lcdf.org/type/#t1utils)
- Optimized for Google Chrome


##Installation

```
$ virtualenv .venv
$ source .venv/bin/activate ; pip install -r requirements.txt
```

Set your mysql username to root and leave password empty. You could also change these settings on line 6 in model.py.

```
$ mysql -u root -p
```
Create new database:

```
mysql> CREATE DATABASE 'Name of database'.sql;
```

Load the preset database:

```
$ .venv/bin/python metapolator/models.py
```

Start web.py application:

```
$ .venv/bin/python run.py
```

This should give you a local webadress you can copy paste into a chrome browser, something like this:

```
http://0.0.0.0:8080/
```

### Deployment

Install supervisor and nginx

```
sudo apt-get install nginx
sudo apt-get install supervisor
```

Create symlinks for configuration file. Notice that your project directory is not different from configs

```
sudo ln -s /var/www/webpy-app/metapolator/webapp_configs/supervisor.conf /etc/supervisor/conf.d/metapolator.conf
sudo ln -s /var/www/webpy-app/metapolator/webapp_configs/nginx.conf /etc/nginx/sites-enabled/metapolator.conf
```

##Note

This project is under active development and moving to stable. Use master branch on your own risk.


##License

The sourcecode of this project is licensed under the [GNU General Public License v3.0](http://www.gnu.org/copyleft/gpl.html).

##Credits

Authors: Simon Egli, Dave Crossland

Contributors: Vitaly Volkov, Walter Egli, Nicolas Pauly, Wei Huang
