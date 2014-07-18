![status](https://secure.travis-ci.org/ck86/gulp-bower-files.png?branch=master)

## Information

<table>
<tr> 
<td>Package</td><td>gulp-bower-files</td>
</tr>
<tr>
<td>Description</td>
<td>Build gulp.src() of your bower package's main files.</td>
</tr>
<tr>
<td>Node Version</td>
<td>>= 0.10</td>
</tr>
</table>

## Usage

```javascript
var gulpBowerFiles = require('gulp-bower-files');

gulp.task("bower-files", function(){
    gulpBowerFiles().pipe(gulp.dest("./lib"));
});
```

This will read your `bower.json`, iterate through your dependencies and build a `gulp.src()` with all files defined in the main property of the packages `bower.json`.
You can override the behavior if you add an `overrides` property to your own `bower.json`. E.g.:

```json
{
    "overrides": {
        "BOWER-PACKAGE": {
            "main": "another.js"
        }
    }
}
```

## Example

### gulpfile.js

```javascript
var gulp = require("gulp");
var bowerFiles = require("gulp-bower-files");

gulp.task("bowerFiles", function(){
    bowerFiles().pipe(gulp.dest("./lib"));
});
```

### bower.json

```javascript
{
  "name": "my-project",
  "dependencies": {
    "jquery": "1.10"
  }
}
```

With this `bower.json` it will copy the jquery.js file from your `bower_components` directory to `./lib/jquery/jquery.js`

```javascript
{
  "name": "my-project",
  "dependencies": {
    "jquery": "1.10"
  },
  "overrides": {
    "jquery": {
      "main": "jquery.min.js"
    }
  }
}
```

With this `bower.json` it will copy the jquery.min.js file from your `bower_components` directory to `./lib/jquery/jquery.min.js`

```javascript
{
  "name": "my-project",
  "dependencies": {
    "jquery": "1.10"
  },
  "overrides": {
    "jquery": {
      "ignore": true
    }
  }
}
```

You can also ignore components like this.

## LICENSE

(MIT License)

Copyright (c) 2013 Christopher Knötschke <cknoetschke@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
