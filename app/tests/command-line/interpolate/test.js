#!/usr/bin/env node

var requirejs = require('requirejs');
require('rootpath')();
requirejs.config(require('config'));

if (require.main === module) {
    requirejs([
          'fs'
        , 'nexpect'
        , 'ufoJS/lib/xml/main'
    ], function (
          fs
        , nexpect
        , xml
    ) {
        var TEST_DIR   = "test-data"
        ,   EXPORT_UFO = "/tmp/result.ufo"
        ,   RESULT     = "/tmp/result.ufo"
        ,   xmlString  = ""
        ,   doc;


        /**
         * Compare the result of an xpath expresson on doc to the expected
         * value.
         */
        var compare_xpath_equal = function( msg, doc, xpath, expected ) 
        {
            var nodes = xml.evaluateXPath( doc, xpath );
            var actual = 'XPath returned more than one result';

            if( nodes.length == 1 ) {
                actual = nodes[0].textContent;
            
                if( actual == expected ) {
                    console.log("PASS: " + msg );
                    return;
                }
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
            var nodes = xml.evaluateXPath( doc, xpath );
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

        console.log("about to setup workspace and perform metapolator tasks.");
        console.log("  this will take a moment to complete.");
        nexpect.spawn("../interpolate-for-non-glif-investigation.sh")
            .wait("See /tmp/result.ufo")
            .run(function (err, stdout, exitcode) {
                if (err) {
                    throw err;
                }
                console.log("have interpolated result...");

                xmlString = fs.readFileSync(RESULT + "/fontinfo.plist", 'utf-8');
                doc = xml.parseXMLString(xmlString);
                compare_xpath_equal( "fontinfo has em setting", doc, 
                                     "/plist/dict/key[text() = 'unitsPerEm']/./following::integer/node()",
                                     "1000" );

                xmlString = fs.readFileSync(RESULT + "/glyphs/contents.plist", 'utf-8');
                doc = xml.parseXMLString(xmlString);
                compare_xpath_equal( "has expected glyph", doc, 
                                     "/plist/dict/key[text() = 'A']/./following::string/node()",
                                     "A_.glif" );
                compare_xpath_node_count( "has expected glyph count", doc, 
                                          "//key",
                                          "1" );

            });

        // next nexpoect.spawn() test here.

    }
)}

