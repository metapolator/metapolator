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

    var encode = function(async, io, sourcePath, dataType){
        dataType = dataType || 'base64';

        if(async)
            throw new NotImplementedError('Asynchronous execution is not yet implemented');

        var zip = new JSZip(),
            files = readDirRecursive(false, io, sourcePath),
            i
            ;
        for (i=0; i<files.length; i++){
            var file = files[i],
                data = io.readFile(false, file)
                ;
            zip.file(file, data, {binary:true});
        }

        return zip.generate({type:dataType});
    };

    return {
        unpack: unpack,
        encode: encode
    };
});
