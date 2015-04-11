define([
    'jszip'
  , 'io/readDirRecursive'
], function(
    JSZip
  , readDirRecursive
) {
    "use strict";

    var unpack = function(zipData, io, targetPath){
        /* TODO: Implement-me! */
    };

    var encode = function(io, sourcePath){
        var zip = new JSZip();
        var files = readDirRecursive(sourcePath);
        var i;

        for (i in files){
            zip.file(files[i], io.readFile(files[i]));
        }

        var content = zip.generate({type:"string"});
        return content;
    };

    return {
        unpack: unpack,
        encode: encode
    };
});
