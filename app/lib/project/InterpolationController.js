define([
    'metapolator/errors'
  , 'ufojs/ufoLib/glifLib/GlyphSet'
    // FIXME: use or remove
    // , './interpolate/'

  , 'metapolator/models/CPS/elements/AtNamespaceCollection'
  , 'metapolator/models/CPS/elements/AtRuleName'
  , 'metapolator/models/CPS/elements/Rule'
  , 'metapolator/models/CPS/elements/ParameterDict'
  , 'metapolator/models/CPS/elements/Parameter'
  , 'metapolator/models/CPS/elements/ParameterName'
  , 'metapolator/models/CPS/elements/ParameterValue'
  , 'complex/Complex'


], function(
    errors
  , GlyphSet

  , AtNamespaceCollection
  , AtRuleName
  , Rule
  , ParameterDict
  , Parameter
  , ParameterName
  , ParameterValue
  , Complex
) {
    "use strict";

    function InterpolationController(project, interpolator) {
        this._project = project;
        this._interpolator = interpolator;
    }
    var _p = InterpolationController.prototype;

    _p.interpolate = function() {
        var masters = project.controller.queryAll('master')
          , interpolator = this._interpolator
          , selections = []
          ;

        console.log('interpolating ...');
        for(var i = 0; i < masters.length; i++) {
            selections.push(masters[i].queryAll(interpolator));
            console.log('selection ' + i + ':');
            console.log(selections[i].map(function(item){ return item +' '+item.particulars }).join(',\n'));
            console.log('_______________');
        }
    }

    return InterpolationController;
});
