The first part of this page describes what the specimen panels in the Parameters and Design Spaces views have in common. The second part describes the glyph interaction that is integrated with the specimen panel in the Parameters view.

## specimen
Masters, master sequences, adjustment masters, adjustment master sequences, instances, strings of instances can appear in a specimen, and any combinations of these six. These six **are known as fonts**, here in this description and in the UI.

here is the general panel (as seen in Design Spaces view):

![](http://mmiworks.net/metapolator/specimen.png)

from the top:

The **local menu** is empty, _and hence it is not an active popup menu item_ (no triangle displayed either). But wait and see if a function turns up here, that’s why it is in the drawing…

The all-important Print function for specimens is advertised through its own like item.

At the top of the panel itself we find the setup line. From left (R–to–L locales: from right):

* **specimen type**; click link to get a list and pick another;
  * specimens are an extendable system (presumably web-tech based); we can expect every script extension to also supply some specimens.
* font **display size**; click number to type;
  * when the specimen uses hardwired sizes (e.g. a 9, 10, 12 & 14pt body text specimen), then this control is not displayed;
  * the **diamond control** next to the pt-size number is a special one—gleaned from other creative-master interfaces (music)—because the the size range is quite large, 6pt to many hundreds (close to a thousand?) and we do not have all the space in the world for a control;
  * this control is a relative one, it in/decreases; users grab the diamond and pull it away (it is attached ‘by wire’ to its centre point) to make a change in the following fashion _(showing the diamond twice here, for educational purposes)_:<br/>
![](http://mmiworks.net/metapolator/tunebywire.png)<br/>
(for R–to–L locales, right and left have to be flipped); we see there is plenty of bail-out area, to make no change;
  * the amount of in/decrease is simply the sum of the x and y offsets the diamond makes; the update of the number and of the specimen itself is of course continuous; users can concentrate on looking at the specimen itself while scooting the diamond around and then…
  * when users release the diamond, it returns to its resting position and the change is permanent.
* the **filter box** is where users type characters to filter the specimen;
  * when the specimen contains real-life words, the Strict control—a discrete, 3-position slider—is displayed next to it—
    * the setting furthest from the word ‘Strict’ is the least strict one; when a word contains at least one character that is in the filter box, it is displayed;
    * the middle setting is semi-strict; only when a word contains a few characters that are in the filter box, it is displayed; how much a few is depends on the word length and how many characters there are in the filter box;
    * the setting closest to the word ‘Strict’ is, well, strict; only words for which every character matches one in the filter box, are displayed.
  * when the specimen contains mechanically-generated glyph sequences, the Strict control is not displayed and the filter is strict (i.e. the generating is based only on the characters in the filter box);
  * when the filter is strict, the specimen guarantees that of every pair g<sub>1</sub>, g<sub>2</sub> out of the characters in the search box, the sequences g<sub>1</sub>g<sub>2</sub> and g<sub>2</sub>g<sub>1</sub> appears at last once in the specimen (guarantee of completeness);
  * the filter box has a popup menu, with the latest 10 filters this user used, and also convenient pre-defined searches (e.g. ‘All Caps’ for the latin script module).
* finally, the **font mix** settings, shown depending on whether there are multiple fonts to show and/or multiple scripts—if either is not the case then their snippet is not displayed; click link to get a list and pick another.

The multiple fonts/scripts can be mixed by the glyph, word, paragraph or section, depending what is available in the specimen—all have glyphs; real-life specimens tend to also have words and paragraphs; mechanically-generated specimens tend to organise that in sections.

Below a demonstration for font mixing—

by paragraph:

![](http://mmiworks.net/metapolator/mixbypara.png)

by word:

![](http://mmiworks.net/metapolator/mixbyword.png)

by glyph:

![](http://mmiworks.net/metapolator/mixbyglyph.png)

**rule**: the specimen scrolls. Where possible, horizontally all typesetting is fitted to the panel width. The setup line does not scroll with the specimen (fixed position).
