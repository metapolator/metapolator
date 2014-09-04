require.config({
    baseUrl: 'lib'
  , paths: {
      'require/domReady': 'bower_components/requirejs-domready/domReady'
    , 'require/text': 'bower_components/requirejs-text/text'
    , 'gonzales': 'npm_converted/gonzales/lib'
    , angular: 'bower_components/angular/angular'
    }
  , shim: {
      angular: {
        exports: 'angular'
      }
    }
});

require([
    'webAPI/document'
  , 'require/domReady'
  // , './models/parameters/factories'
  , 'gonzales/gonzales'
], function (
    document
  , domReady
  // , parameterFactories
  , gonzales
) {
    "use strict";
    domReady(function() {
        var css = "body{ \n  background-color /*property comment*/: #fff;\n\
  margin: 0 auto;\n\
filter:progid:DXImageTransform.Microsoft.AlphaImageLoader(src='a.png',sizingMethod='scale')}\
/* And a comment */ \
strange>.selector\
/* selector comment \n with linebreak */\
,and another one\
missing.delim >\
{ any-param\n: unheard-of(style + css);\
/* a comment within a block */\
another-one: def-unheard-of(style + css)/*this param has a comment*/;\
}\
@media whatever{ hi{name:val} }\
";
        var pre = document.createElement('pre');
        pre.appendChild(document.createTextNode(css));
        document.body.appendChild(pre);
        
        var ast = gonzales.srcToCSSP(css)
          , tree = gonzales.csspToTree(ast);
        
        var result = parameterFactories.rulesFromAST(ast)
        console.log('parameterFactories.rulesFromAST(ast)', result)
        var pre = document.createElement('pre');
        pre.appendChild(document.createTextNode(result));
        document.body.appendChild(pre);
        
        var pre = document.createElement('pre');
        pre.appendChild(document.createTextNode(tree));
        document.body.appendChild(pre);
        
    })
})
