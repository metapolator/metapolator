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
        var files = readDirRecursive(false, io, sourcePath);
        var i;

        for (i in files){
            var file = files[i];
            var relative_path = file.split(sourcePath)[1];
            var data = io.readFile(false, file);
            zip.file(relative_path, data, {binary:true});
        }

        var content = zip.generate({type:"base64"});
        return content;
    };

    return {
        unpack: unpack,
        encode: encode
    };
});
