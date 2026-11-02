// A minimal ZIP reader (stored and deflated entries) for the WASM tests,
// so that they need nothing beyond Node itself.
"use strict";
const zlib = require('zlib');

module.exports = function unzip(buf) {
    // end of central directory
    let eocd = buf.length - 22;
    while (eocd >= 0 && buf.readUInt32LE(eocd) !== 0x06054b50) eocd--;
    if (eocd < 0) throw new Error('not a ZIP file');
    const count = buf.readUInt16LE(eocd + 10);
    let p = buf.readUInt32LE(eocd + 16);
    const out = [];
    for (let i = 0; i < count; i++) {
        if (buf.readUInt32LE(p) !== 0x02014b50) throw new Error('bad central directory');
        const method = buf.readUInt16LE(p + 10)
            , csize = buf.readUInt32LE(p + 20)
            , nlen = buf.readUInt16LE(p + 28), xlen = buf.readUInt16LE(p + 30), clen = buf.readUInt16LE(p + 32)
            , local = buf.readUInt32LE(p + 42)
            , name = buf.toString('utf8', p + 46, p + 46 + nlen);
        p += 46 + nlen + xlen + clen;
        const start = local + 30 + buf.readUInt16LE(local + 26) + buf.readUInt16LE(local + 28)
            , data = buf.subarray(start, start + csize);
        if (name.endsWith('/')) continue;
        out.push([name, method === 0 ? Buffer.from(data) : zlib.inflateRawSync(data)]);
    }
    return out;
};
