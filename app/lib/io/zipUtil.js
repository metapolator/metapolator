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
        if (async)
            throw new NotImplementedError('Asynchronous ZIP unpack method is not yet implemented');

        var zip = new JSZip(zipData)
          , files = zip.files
          , filename
          , file
          , absolute_path
          , dir_abs_path
          ;

        console.log("<unpack> zip.files: ", zip.files);

        for (filename in files){
            file = files[filename];
            absolute_path = [targetPath, file.name].join(targetPath[targetPath.length-1]=='/' ? "" : "/");

            if (file.dir){
                console.log("file.dir == TRUE; absolute_path: ", absolute_path);
                io.mkDir(false, absolute_path);
            } else {
                dir_abs_path = absolute_path.substring(0, absolute_path.lastIndexOf("/"));
                console.log("file.dir == FALSE; absolute_path: " + absolute_path + "        dir_abs_path: " + dir_abs_path);
                io.ensureDir(false, dir_abs_path);
                io.writeFile(false, absolute_path, file.asBinary());
            }
        }
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
