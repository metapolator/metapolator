#!/usr/bin/env node


var fs = require('fs');
var nexpect = require('nexpect');
var xpathjs = require('xpath.js');
var dom = require('xmldom').DOMParser;

var TEST_DIR   = "test-data"
var EXPORT_UFO = "/tmp/result.ufo"


/**
 * Compare the result of an xpath expresson on doc to the expected
 * value.
 */
var compare_xpath_equal = function( msg, doc, xpath, expected ) 
{
    var nodes = xpathjs( doc, xpath )
    var actual = nodes[0].toString();
    
    if( actual == expected ) {
        console.log("PASS: " + msg );
        return;
    }
    console.log("FAIL: " + msg );
    console.log("  EXPECTED: " + expected );
    console.log("    ACTUAL: " + actual );
}

/**
 * It might be handy to use the xpath count(//foo) but xpathjs has a
 * problem with that res.toArray() inside xpathjs(). So this takes a
 * non count(...) xpath and compares the size of the resulting array
 * to the expected number of elements.
 */
var compare_xpath_node_count = function( msg, doc, xpath, expected ) 
{
    var nodes = xpathjs( doc, xpath )
    var actual = nodes.length;
    
    if( actual == expected ) {
        console.log("PASS: " + msg );
        return;
    }
    console.log("FAIL: " + msg );
    console.log("  EXPECTED: " + expected );
    console.log("    ACTUAL: " + actual );
}

/*********************/
/* begin main script */
/*********************/

process.chdir( TEST_DIR );

// Test non glif output of interpolation.
var RESULT = "/tmp/result.ufo";

console.log("about to setup workspace and perform metapolator tasks.");
console.log("  this will take a moment to complete.");
nexpect.spawn("../interpolate-for-non-glif-investigation.sh")
    .wait("See /tmp/result.ufo")
    .run(function (err, stdout, exitcode) {
        if (err) {
            throw err;
        }
        console.log("have interpolated result...");

        var xml = fs.readFileSync(RESULT + "/fontinfo.plist", 'utf-8');
        var doc = new dom().parseFromString(xml)    
        compare_xpath_equal( "fontinfo has em setting", doc, 
                             "/plist/dict/key[text() = 'unitsPerEm']/./following::integer/node()",
                             "1000" );

        var xml = fs.readFileSync(RESULT + "/glyphs/contents.plist", 'utf-8');
        var doc = new dom().parseFromString(xml)    
        compare_xpath_equal( "has expected glyph", doc, 
                             "/plist/dict/key[text() = 'A']/./following::string/node()",
                             "A_.glif" );
        compare_xpath_node_count( "has expected glyph count", doc, 
                                  "//key",
                                  "1" );
    });







