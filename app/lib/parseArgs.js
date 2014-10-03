define([
    'metapolator/errors'
], function (
    errors
) {
    "use strict";

    // Parsing functions for command-line arguments
    var parseArg = {};

    var CommandLineError = errors.CommandLine;

    parseArg.masterName = function (s) {
        if(s.indexOf('/') !== -1 || s.indexOf('\\') !== -1)
            throw new CommandLineError('/ and \\ are not allowed in a '
                                      + 'Master name: ' + s);
        return s;
    }

    return parseArg;
})
