Mac OS X
--------

Install and run MySQL

```sh
brew install mysql;
launchctl load ~/Library/LaunchAgents/homebrew.mxcl.mysql.plist;
ln -sfv /usr/local/opt/mysql/*.plist ~/Library/LaunchAgents;
mysql.server start;
```

Install FontForge python:
```
brew install python;
brew install fontforge --HEAD;
```

Install and run Metapolator
```sh
make install;
make setup;
make run;
open static/demo_fonts/;
open "http://0.0.0.0:8080/";
```

Then you can create a username, login, click 'editor' at the top, then click 'controlpoints mode' and drag in the example fonts. 
