define(['jszip'], function(JSZip) {
    "use strict";

    var unpack = function(zipData, io, targetPath){
        /* TODO: Implement-me! */
    };

    var encode = function(io, sourcePath){
        var zip = new JSZip();

        /*For now I'll simply create a zip file
          with some arbitrary sample files in it.

          In the next commits we'll substitute that by the actual
          traverse of the subtree rooted at "sourcePath". */

        zip.file("Hello.txt", "Hello World\n");
        var f = zip.folder("folder");
        f.file("Again.txt", "Yeah!\n");
        var content = zip.generate({type:"string"});
        return content;
    };

    return {
        unpack: unpack,
        encode: encode
    };
});
