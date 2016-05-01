// Learn more about configuring this file at <https://github.com/theintern/intern/wiki/Configuring-Intern>.
// These default settings work OK for most people. The options that *must* be changed below are the
// packages, suites, excludeInstrumentation, and (if you want functional tests) functionalSuites.
define([
    '../lib/bower_components/Atem-RequireJS-Config/browserConfig'
], function(
    configure
) {
    var setup = {
            // Packages that should be registered with the loader in each testing environment
            // packages: [ { name: 'metapolator', location: 'lib' } ]
            nodeRequire: require // ? what is this good for?
          //, baseUrl: 'lib'
          , bowerPrefix: 'lib/bower_components'
          , paths: {
                'metapolator': 'lib'
            }
          , shim: {
                angular: {
                  deps: ['jquery'],
                  exports: 'angular'
                }
            }
        }
      , loaderConfig
        // duck typing the require.config API to extract the final configuration
      , requireAPI = {
            config: function(configuration){ this.configuration = configuration; }
         , configuration: null
        }
      ;

    configure(setup, requireAPI);
    loaderConfig = requireAPI.configuration;

    return {
        // The port on which the instrumenting proxy will listen
        proxyPort: 9000,

        // A fully qualified URL to the Intern proxy
        proxyUrl: 'http://localhost:9000/',

        // Default desired capabilities for all environments. Individual capabilities can be overridden by any of the
        // specified browser environments in the `environments` array below as well. See
        // https://code.google.com/p/selenium/wiki/DesiredCapabilities for standard Selenium capabilities and
        // https://saucelabs.com/docs/additional-config#desired-capabilities for Sauce Labs capabilities.
        // Note that the `build` capability will be filled in with the current commit ID from the Travis CI environment
        // automatically
        capabilities: {
            'selenium-version': '2.39.0'
        },

        // Browsers to run integration testing against. Note that version numbers must be strings if used with Sauce
        // OnDemand. Options that will be permutated are browserName, version, platform, and platformVersion; any other
        // capabilities options specified for an environment will be copied as-is
        environments: [
            { browserName: 'internet explorer', version: '11', platform: 'Windows 8.1' },
            { browserName: 'internet explorer', version: '10', platform: 'Windows 8' },
            { browserName: 'internet explorer', version: '9', platform: 'Windows 7' },
            { browserName: 'firefox', version: '27', platform: [ 'OS X 10.6', 'Windows 7', 'Linux' ] },
            { browserName: 'chrome', version: '32', platform: [ 'OS X 10.6', 'Windows 7', 'Linux' ] },
            { browserName: 'safari', version: '6', platform: 'OS X 10.8' },
            { browserName: 'safari', version: '7', platform: 'OS X 10.9' }
        ],

        // Maximum number of simultaneous integration tests that should be executed on the remote WebDriver service
        maxConcurrency: 3,

        // Whether or not to start Sauce Connect before running tests
        useSauceConnect: true,

        // Connection information for the remote WebDriver service. If using Sauce Labs, keep your username and password
        // in the SAUCE_USERNAME and SAUCE_ACCESS_KEY environment variables unless you are sure you will NEVER be
        // publishing this configuration file somewhere
        webdriver: {
            host: 'localhost',
            port: 4444
        },

        // The desired AMD loader to use when running unit tests (client.html/client.js). Omit to use the default Dojo
        // loader
        useLoader: {
            'host-node': 'requirejs',
            'host-browser': '../lib/bower_components/requirejs/require.js'
        },

        // Configuration options for the module loader; any AMD configuration options supported by the specified AMD loader
        // can be used here
        loader: loaderConfig,
        // Non-functional test suite(s) to run in each browser
        suites: [
            // we run this from the commandline if the other tests have passed;
            // this solutions caused trouble (no output on console, newer intern
            // said a node "hang" was detected etc.)
            // See the npm test definition in package.json how export/test.sh is called
            //  'tests/lib/export/_all_'
            'tests/lib/models/CPS/_all_'
          , 'tests/lib/models/MOM/_all_'
        ],

        // Functional test suite(s) to run in each browser once non-functional tests are completed
        functionalSuites: [ /* 'myPackage/tests/functional' */ ],

        // A regular expression matching URLs to files that should not be included in code coverage analysis
        excludeInstrumentation: /intern|tests/
    };
});
