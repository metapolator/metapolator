Today [Metapolator](http://metapolator.com/purple-pill) only runs _out of the box_ with the latest version of Firefox, because the Firefox team shipped new features that Metapolator depends on.

Chrome can run Metapolator, and a little faster too, after restarting it from Terminal with some options.

1. If you have enabled `chrome://flags/#enable-javascript-harmony` then disable it.
2. Quit the browser
3. Open a Terminal and run:

Mac OS X users
```sh
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --js-flags="--harmony --harmony_proxies";
```
GNU+Linux users
```sh
chromium-browser --js-flags="--harmony --harmony_proxies";
```
or
```sh
$ google-chrome-stable --js-flags="--harmony --harmony_proxies";
```

# Support the Project

If you want to see Metapolator continue to improve, please order a fine logo T-shirt for US$20 from <https://teespring.com/metapolator-beta-0-3-0> today