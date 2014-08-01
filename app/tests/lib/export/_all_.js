"use strict";
define([
    'intern!object'
  , 'intern/chai!assert'
  , 'intern/dojo/node!child_process'
], function (registerSuite, assert, child_process) {
    registerSuite({
        name: 'Export',
        Export_Constructor: function() {
            // FIXME: Use child_process.execSync when it becomes available;
            // currently when we get an error the test count says it passed, even
            // though the error is eventually noticed by intern.
            // FIXME: log the output of the test script
            var proc = child_process.exec('./test.sh', {'cwd': './tests/lib/export'},
                                          function (error, stdout, stderr) {
                                              assert.strictEqual(error, null);
                                          });
        }
    });
});
