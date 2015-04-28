Today [Metapolator](http://metapolator.com/purple-pill) only runs _out of the box_ with the latest version of Firefox, because the Firefox team shipped new features that Metapolator depends on.

Chrome can run Metapolator, and a little faster too, after restarting it from Terminal with some options.

First, quit the browser. 

Then, if you use a Mac, open Terminal and run:
```sh
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --js-flags="--harmony --harmony_proxies";
```

If you use GNU+Linux, open a shell and run:
```sh
chromium-browser --js-flags="--harmony --harmony_proxies"; 
google-chrome-stable --js-flags="--harmony --harmony_proxies";
```

If you have enabled `chrome://flags/#enable-javascript-harmony`, then disable it.

# Learn more

Our [FAQ](https://github.com/metapolator/metapolator/wiki/faq) answers some common questions about the project.

If you want to see Metapolator continue to improve, please order a fine logo T-shirt for US$20 (+ shipping) from <https://teespring.com/metapolator-beta-0-3-0> or donate via PayPal to lasse@graphicore.de