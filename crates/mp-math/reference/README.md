# Reference sources

`ieee754.cc` is V8's `src/base/ieee754.cc` exactly as shipped in Node.js
v20.19.2 (`deps/v8`, V8 11.3.244.8):

    curl -sfL https://raw.githubusercontent.com/nodejs/node/v20.19.2/deps/v8/src/base/ieee754.cc

It is the source of the line-by-line port in `../src/v8.rs` (BSD-style
license, see the file header). It is kept here so the port can be reviewed
against the original. It is not compiled.
da01a54955911cfc550117988de91516c6f1aac343af28142dce619b433a67fc  crates/mp-math/reference/ieee754.cc
