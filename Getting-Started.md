Getting Started with Metapolator Demo
==============================
[Metapolator Demo](http://metapolator.com/purple-pill) runs in a current version of FireFox. It also runs in Chromium/Google Chrome if you start Chromium/Chrome from command-line.

In order to run Metapolator in Chromium/Chrome
-----------------------------------------------------------------
- Make sure that chrome://flags/#enable-javascript-harmony is disabled (it is by default).
- Close all running instances of Chromium/Chrome.
- Then start Chromium/Chrome from the command-line with --js-flags="--harmony --harmony_proxies"

Current *ubuntu linux that might be for Chromium:
$ chromium-browser --js-flags="--harmony --harmony_proxies"

Current *ubuntu linux that might be for Google Chrome:
$ google-chrome-stable --js-flags="--harmony --harmony_proxies"

On OSX that might be for Google Chrome:
$ /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --js-flags="--harmony --harmony_proxies"