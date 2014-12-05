define([
    'metapolator/errors'
  , 'metapolator/project/MetapolatorProject'
], function (
    errors
  , MetapolatorProject
) {
    "use strict";

    // Parsing functions for command-line arguments
    var parseArgs = {};

    var CommandLineError = errors.CommandLine;

    parseArgs.masterName = function (s) {
        if(s.indexOf('/') !== -1 || s.indexOf('\\') !== -1)
            throw new CommandLineError('/ and \\ are not allowed in a '
                                      + 'Master name: ' + s);
        return s;
    }

    parseArgs.project = function (io, s) {
        if (s === undefined || s == '')
            s = process.cwd();
        if (s.slice(-1) != '/')
            s += '/';
        var project = new MetapolatorProject(io, s);
        if (!io.pathExists(false, project.dataDir))
            throw new CommandLineError('\'' + s + '\' does not look '
                                      + 'like a Metapolator project');
        return project;
    }

    parseArgs.projectMaster = function (io, s) {
        var split = s.lastIndexOf('/');
        return [parseArgs.project(io, s.substr(0, split)), parseArgs.masterName(s.substr(split + 1))];
    }

    parseArgs.masterInstancePairs = function (args) {
        if(args.length%2 !== 0)
            throw new CommandLineError('There must be an even-length '
                    + 'list of [master ufo] arguments. Otherwise '
                    + 'not all masters have an instance target.');
        for(var i=0;i<args.length;i=i+2)
            args[i] = parseArgs.masterName(args[i]);
        return args;
    }

    return parseArgs;
})
