define([
    'jszip'
  , 'io/readDirRecursive'
  , 'metapolator/errors'
], function(
    JSZip
  , readDirRecursive
  , errors
) {
    "use strict";

    var NotImplementedError = errors.NotImplemented;

    var unpack = function(async, zipData, io, targetPath){
        throw new NotImplementedError('ZIP unpack method is not yet implemented');
    };

    var encode = function(async, io, sourcePath){
        if(async)
            throw new NotImplementedError('Asynchronous execution is not yet implemented');

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
