var fs = require("fs");
var path = require("path");
var gulp = require("gulp");
var gutil = require("gulp-util");
var PluginError = gutil.PluginError

const PLUGIN_NAME = "gulp-bower-files";

/**
 * Attempts to load a configuration for a particular dependency.
 * Looks in dependencyConfig.basePath for .bower.json, bower.json, 
 * package.json, then component.json in order returning the first found.
 * @param {Object} Config containing a .basePath param in which to look for config files
 * @returns {Object} Parsed JSON file
 */
var loadConfigJson = function(dependencyConfig) {
    jsonPath = firstExistingFile([
        path.join(dependencyConfig.basePath, ".bower.json"),
        path.join(dependencyConfig.basePath, "bower.json"),
        path.join(dependencyConfig.basePath, "package.json"),
        path.join(dependencyConfig.basePath, "component.json")
    ]);

    if(!jsonPath){
        if(dependencyConfig.main){
            return dependencyConfig;
        }
        
        throw new PluginError(PLUGIN_NAME, "The bower package " + dependencyConfig.name + " has no bower.json or package.json, use the overrides property in your bower.json");
    }

    var json = JSON.parse(fs.readFileSync(jsonPath))

    if(!json.main && !dependencyConfig.main){
        throw new PluginError(PLUGIN_NAME, "The bower package " + dependencyConfig.name + " has no main file(s), use the overrides property in your bower.json");
    }
    
    return json;
}

/**
 * Given a list of paths, return the first path that exists.
 * @param paths {array[string]} ordered array of paths to check.
 * @return {string} First path that exists or null if none exist.
 */
var firstExistingFile = function(paths) {
    return paths.reduce(function(prev, curr) {
        if (prev) return prev;
        return fs.existsSync(curr)? curr : null;
    }, null);
}

/**
 * Adding glob path to the srcs array
 * @param {Array}           srcs        The srcs array
 * @param {String}          basePath    Base path to the bower component
 * @param {Array|String}    main        Path to the main file(s)
 */
var mainPaths = function(basePath, main){
    if(!Array.isArray(main)){
        main = [main];
    }
    return main.map(function(item) {
        var basename = path.basename(item);
        return path.join(basePath, item);
    }); 
}

/**
 * Finds the main configuration for this project and pulls in overrides.
 * @param {String} bowerDirectory   Directory bower has downloaded dependencies to (usually bower_components)
 * @param {String} bowerJsonPath  Path to bower.json file for this project.
 * @returns {Array} Paths to all dependent main files
 */
var gatherMainFiles = function(bowerDirectory, bowerJsonPath, includeDev) {
    try {
        var bowerJson = JSON.parse(fs.readFileSync(bowerJsonPath));
    } catch (e) {
        throw new PluginError(PLUGIN_NAME, "The bower.json file at " + bowerJsonPath + " is not valid JSON. ");
    }

    if(!bowerJson.dependencies){
        throw new PluginError(PLUGIN_NAME, "The project bower.json has no dependencies listed. This plugin has nothing to do!");
    }
    
    var packageJson = bowerJson.overrides || {};
    var seenPackages = {};
    return processDependencies(bowerDirectory, packageJson, bowerJson, seenPackages, includeDev);
}

/**
 * Reads a config file to find main files and any dependent main files.
 * @param {String} bowerDirectory   Directory bower has downloaded dependencies to (usually bower_components)
 * @param {String} packageJson      Local configuration object for entire project
 * @param {Object} jsonConfig       Parsed JSON object from the config file process
 * @param {Object} seenPackages     Hash of already included dependencies to prevent cycling
 * @returns {Array}                 Paths to this jsonConfig's main file and paths to any main files it depends on
 */
var processDependencies = function(bowerDirectory, packageJson, jsonConfig, seenPackages, includeDev) {
    var srcs = [];

    function mergeObjects(obj1,obj2){
        var obj3 = {};
        for (var attrname in obj1) { obj3[attrname] = obj1[attrname]; }
        for (var attrname in obj2) { obj3[attrname] = obj2[attrname]; }
        return obj3;
    }

    if (includeDev){
        dependencies = mergeObjects(jsonConfig.dependencies, jsonConfig.devDependencies);
    } else{
        dependencies = jsonConfig.dependencies;
    }

    for(var dependency in dependencies){
        var dependencyConfig = packageJson[dependency] || {};

        if(dependencyConfig.ignore === true || seenPackages[dependency]){
            continue;
        }

        dependencyConfig.name = dependency;
        seenPackages[dependency] = true;

        dependencyConfig.basePath = dependencyConfig.basePath || path.join(bowerDirectory, dependency);
              
        var configJson = loadConfigJson(dependencyConfig);

        dependencyConfig.main = dependencyConfig.main || configJson.main;

        if(typeof dependencyConfig.dependencies !== "undefined"){
            configJson.dependencies = dependencyConfig.dependencies;
        }
        
        var paths = processDependencies(bowerDirectory, packageJson, configJson, seenPackages)
                    .concat(mainPaths(dependencyConfig.basePath, dependencyConfig.main));
      
        srcs = srcs.concat(paths);
    }

    return srcs;
}

var gulpBowerFiles = function(opts){
    opts = opts || {};

    if(!opts.paths)
        opts.paths = {}

    var bowerJsonPath = opts.paths.bowerJson || "./bower.json";
    var bowerrcPath = opts.paths.bowerrc || "./.bowerrc";
    var bowerDirectory = opts.paths.bowerDirectory || "./bower_components";

    if(fs.existsSync(bowerrcPath)){
        bowerDirectory = path.dirname(bowerrcPath);
        bowerDirectory = path.join(bowerDirectory, "/", (JSON.parse(fs.readFileSync(bowerrcPath))).directory);
    }

    if(!bowerJsonPath || !fs.existsSync(bowerJsonPath)){
        throw new PluginError(PLUGIN_NAME, "bower.json file does not exist at "+bowerJsonPath);
    }

    if(!bowerDirectory || !fs.existsSync(bowerDirectory)){
        throw new PluginError(PLUGIN_NAME, "Bower components directory does not exist at "+bowerDirectory);
    }

    if(!opts.base)
        opts.base = bowerDirectory;

    if(!opts.includeDev)
        opts.includeDev = false;

    var srcs = gatherMainFiles(bowerDirectory, bowerJsonPath, opts.includeDev);

    return gulp.src(srcs, opts);
}


module.exports = gulpBowerFiles
