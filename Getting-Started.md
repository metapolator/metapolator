# Getting Started with Metapolator Demo

[Metapolator Demo](http://metapolator.com/purple-pill) runs in a current version of FireFox. 
It also runs in Google Chrome and Chromium if you start it from a Terminal with some options.

## Using Chrome/Chromium

1. Visit `chrome://flags/#enable-javascript-harmony` and check that it is disabled (it is by default.)
2. Quit the browser
3. Open a Terminal and run:

Mac OS X users
```sh
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --js-flags="--harmony --harmony_proxies"
```
GNU+Linux users
```sh
chromium-browser --js-flags="--harmony --harmony_proxies"
```
or
```sh
$ google-chrome-stable --js-flags="--harmony --harmony_proxies"
```
