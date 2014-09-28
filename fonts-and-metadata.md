The fonts panel (in the Fonts view) is more or less a column extension of the instances panel:

![](http://mmiworks.net/metapolator/fontscolumn.png)

the two scroll in sync. **note** that all instance management functions are also available here, including organisation into strings. Clicking in the fonts column checks (2nd time: unchecks) an instance to be exported as font.

* mouse-down in the fonts panel, drag across multiple instances, release: switches the export mode of all instances involved on/off, depending on whether the mouse-down instance went on or off;
* the toggle is on mouse-down; when the mouse is down and moved outside the fonts panel, the item is un-toggled (also for the swipe action above); when the mouse is released outside the fonts panel, the export mode of the item is un-changed(also for the swipe action above).

Export is though the button at the bottom of the fonts panel. It normally shows a folder selection dialog—to pick the export target location (defaults to location last time used for this project)—unless cmd/ctrl is pressed (button label then: ‘Export’) and the dialog is skipped and the export done to the location last time used for this project.

Above we see that two of the four to-be-exported instances have opentype features set up for them. In quite a few cases the ufo -> master -> instance path is unambiguous enough to make that happen by magic. In quite a few other cases users will have to do that by hand, on (multi-)selected instances via the local menu. Clicking the ot.fea indicator (its underlined on mouse-over) shows the actual definitions for this instance—this can be as crude as showing the definition text in a new browser tab.

The local menu is as follows:

* Check All
* Uncheck All
* -- \<separator\> --
* Copy Opentype Features from Master…
* Copy Opentype Features from Font…
* Load Opentype Features File…
* -- \<separator\> --
* Show Opentype Features
* -- \<separator\> --
* Remove Opentype Features

**notes:**

* these menu commands operate on single and multiple selections of instances and strings of instances;
* **Copy Opentype Features from Master…** shows a list of masters in this project that have opentype features defined; after users pick one, it extracts the opentype features and assigns the content to the selection;
* **Copy Opentype Features from Font…** extracts the opentype features out of a ufo file and assigns the content to the selection;
* **Load Opentype Features File…** reads .fea files and assigns the content to the selection;
* **Show Opentype Features** works only for items that have them; same as clicking the ot.fea indicator;
* **Remove Opentype Features** works only for items that have them.

Checking a string of instances for export or setting its opentype features sets all the instance to belong to it:

![](http://mmiworks.net/metapolator/fontsstring.png)

No override is possible, to control the belonging instances individually, the check and/or opentype features must be removed from the string.

## metadata
We all know that setting and maintaining metadata is a pain in the neck. Therefore we will try to inflict as little as possible on users. Some basic strategies:

* when metapolator can calculate or best-guess (e.g. font names from instance names) metadata, it pre fills the field;
* edit data once, on a higher level—
  * why edit data for each font when it can be set once for the family?
  * why edit data for each family when it can be set once for the project?
  * why edit data for each project when it can be set once for this user/computer?
* cut down the jungle—segment the 50 or so keys into logical categories.

This **general interaction mechanism** implements the strategies above:

![](http://mmiworks.net/metapolator/metadata.png)

The category segmentation (in a vertical tab system here) makes the number of keys to be shown reduced to around half a dozen. This makes that resorting them into global / project / family / font order is possible.

Metapolator will push to define every key at the highest possible level (i.e. copyright is configured to be set at project level) and—even better—fill in the values where it can. Above we see that for this category nothing is set at global level, one key at project, two at family and three keys at font level.

**rule**: for fonts that are not part of a family, the family level is not shown. For families the font level is not shown.

If users want to redefine a high-level key definition (i.e. set at project level), then they can pick it from the overrides popup and the key appears at the lower level:

![](http://mmiworks.net/metapolator/metaoverride.png)

the high-level key definition is now disabled for this font, and editable at font level. We see that the override field can be removed (which enables again the high-level key definition).

Users can promote key definition to a higher level through drag-and-drop:

![](http://mmiworks.net/metapolator/metaup.png)

this is how also the global level (the user/computer one) can be populated (e.g. always the same copyright? make it global).