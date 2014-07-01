Glyph Inspector
======

Tool that providing glyph inspection view, baseed on @graphicore ufojs


###File Uploader
Provides ```<file-uploader></file-uploader>``` directive
 * ```type="[application/zip]"``` - allow upload files by MIME type;
 * ```file="file"``` - angularjs data binding;
 * ```file-name="FileName"``` - angularjs data binding;
 * ```data-max-file-size="100"``` - maximum file size limit in megabytes.
Provides gui element for loading *.ufo.zip into the app.
And unpack zip archive using @gildas-lormeau [zip.js](http://gildas-lormeau.github.io/zip.js/) to localStorage.

###File Viewer
Provides ```<file-viewer></file-viewer>``` directive

Provides gui element for showing the ```<select></select>``` of existing files in your zip archive.

Provides events and data-binding to show the result glyph file as svg, and raw *.glif file.

 