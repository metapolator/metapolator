
The Metapolator Blog Source Code
==================================

This blog uses the Up theme, a clean and beautiful 
[Bootstrap](http://getbootstrap.com) based layout
for [Jekyll](https://github.com/mojombo/jekyll).

## Installation

- Install the ImageMagick dependency `brew install imagemagick`
- Install the npm dependency `brew install npm`
- Clone this repo: `git clone https://github.com/metapolator/metapolator.git metapolator`
- Switch to the gh-pages branch: `cd metapolator; git checkout gh-pages`
- Run the bundler in the blog folder to get the Ruby dependencies: `bundle`
- Run the npm installer in the blog folder to get the JS dependencies: `npm install`

## Usage

- Run the jekyll server: `rake preview`.

You should have a server up and running locally at <http://localhost:4000>.

## Customization

Change the `_assets` directory's `less` and `js` files, and run
`make` to compile the files.

After changing the author email configured in `_config.yml`, run 
`rake icons` to get new gravatar images for the apple-touch-* files.

## Deployment

Push to github in the normal way:

`git push origin gh-pages`

## Licensing

The Up theme is available under the 
[MIT License](https://github.com/metapolator/metapolator/blob/gh-pages/LICENSE)
