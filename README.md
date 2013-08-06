##About

Metapolator is a web-based parametric font editor. It provides a GUI for designing with Metafont – a program and language for semi-algorithmic specification of fonts. Metapolator was created out of the need to create large type families efficiently. [more](http://metapolator.com/)

Requirements
- [MySQL](http://dev.mysql.com/downloads/mysql/)
- [Python](http://www.python.org/)
- [python-mysqldb](http://sourceforge.net/projects/mysql-python/)
- [web.py](http://webpy.org/)
- [FontForge](http://sourceforge.net/projects/fontforge/files/fontforge-source/)
- [mf2pt1](http://www.ctan.org/tex-archive/support/mf2pt1)
- [Type 1 utilities](http://www.lcdf.org/type/#t1utils)


##Installation

Set your mysql username to root and leave password empty. You could also change these settings on line 6 in model.py.
```
$ mysql -u root -p
```
Load the preset database:
```
mysql> USE blog;
mysql> SOURCE dbscript.sql;
mysql> SOURCE mysqlview.sql;
```
Start web.py application:
```
$ python mfg.py    
```
This should give you a local webadress you can copy paste into a chrome browser, something like this:
```
http://0.0.0.0:8080/
```

####Note

ttf2eot should be installed in the Metapolator directory. 

The mf2pt1.pl script will need to be modified as follows:  
In the section   
```
    # Create a FontForge script file.
```
replace  
```
Generate($1);
```
with  
```
foreach
  SetCharName(NameFromUnicode(GlyphInfo("Unicode")))
endloop
Generate($1);
Generate($1:r + ".otf");
Generate($1:r + ".ttf");
```


##Usage
Settings:
- Go to Settings and choose a project id. 
- Select a glyph and save

Editor:
- Select a point of the glyph to start the editing window.

To copy and replace an existing project folder, type in '1001' at load-option in Settings. Once copied the preset folder the two fonts can be replaced by other .ufo fonts. 
Glyph names are incremental numbers – see glyphnames.txt file for reference.

##Screenshots

![Metapolator interface](/metapolator.png)


##License

The sourcecode of this project is licensed under the [GNU General Public License v3.0](http://www.gnu.org/copyleft/gpl.html).


##Credits

Metapolator is developed by Simon Egli, Walter Egli and Wei Huang.
