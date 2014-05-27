"use strict";
define([], function() {
    /**
     * This is a module to pull in an Ecmascript 6 compatible Promise
     * implementation for NodeJS. For browsers: only decent/current browsers
     * are supported. Older firefox may have Promise by setting in
     * "dom.promise.enabled" in about:config to true.
     */
    if(typeof window !== 'undefined')
        if(window.Promise)
            return window.Promise
        else
            throw new Error('Your Browser doesn\'t support promises yet')
    else
    // expect node.js and expect the AMD Loader to provide the original node require
        return require.nodeRequire('lie')
});
