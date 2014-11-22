#!/usr/bin/env node

var requirejs = require('requirejs');
require('rootpath')();
requirejs.config(require('config'));

if (require.main === module) {
    requirejs([
          'fs'
        , 'ufoJS/lib/xml/main'
    ], function (
          fs
        , xml
    ) {
        var xmlString  = ""
        ,   doc;


        /**
         * Compare the result of an xpath expresson on doc to the expected
         * value.
         */
        var compare_xpath_count = function( msg, doc, xpath, expected ) 
        {
            var nodes = xml.evaluateXPath( doc, xpath );
            var actual = 'XPath returned more than one result';

            if( nodes.length == expected ) {
                console.log("PASS: " + msg );
                return;
            }
            console.log("FAIL: " + msg );
            console.log("  EXPECTED: " + expected );
            console.log("    ACTUAL: " + actual );
            console.log("    RESULT.length: " + nodes.length );
            process.exit(1);
        }

        /*********************/
        /* begin main script */
        /*********************/
        var xmlFilename     = process.argv[2]
        ,   xpathExpression = process.argv[3]
        ,   expected        = process.argv[4]
        ;

        xmlString = fs.readFileSync( xmlFilename, 'utf-8');
        doc = xml.parseXMLString(xmlString);
        compare_xpath_count( "test", doc, xpathExpression, expected );

    }
)}

