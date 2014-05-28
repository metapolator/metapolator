# tildify [![Build Status](https://travis-ci.org/sindresorhus/tildify.png?branch=master)](http://travis-ci.org/sindresorhus/tildify)

> Convert an absolute path to tilde path: `/Users/sindresorhus/dev` => `~/dev`


## Install

Install with [npm](https://npmjs.org/package/tildify)

```
npm install --save tildify
```


## Example

```js
var tildify  = require('tildify');
tildify('/Users/sindresorhus/dev');
//=> ~/dev
```


## License

MIT © [Sindre Sorhus](http://sindresorhus.com)
