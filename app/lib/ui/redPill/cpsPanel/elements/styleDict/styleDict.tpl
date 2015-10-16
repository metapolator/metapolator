<div>{{ctrl.element.particulars}}</div>
<ol class="container">
<li>
    element properties
    <mtk-cps-property-dict
        cps-property-dict="ctrl.element.properties"
        ></mtk-cps-property-dict>
</li>
<li ng-repeat="item in ctrl.items track by $index + ':' + item[1].nodeID">
    <div ng-repeat="traceItem in item[2].slice().reverse()  track by $index"
        ng-switch="traceItem.constructor.name"
        style="padding-left: calc({{$index}} * 1em)"
        ><div
            ng-switch-when="ParameterCollection"
            style="font-family: monospace;"
            ><span ng-if="$index != 0">@import</span>
             <span ng-if="$index == 0">root file:</span>
             "{{traceItem.source.name}}";</div><!--

             FIXME:TODO: I think it is bad having these mtk-cps-selector-list
             elements here to be changed because it's not obvious that the
             namespaces (usually) contain more rules. It would be better to
             have links here that load the cps-collection which contains
             the namespace and scroll there to the definition of that
             namespace.
        --><div
            ng-switch-when="AtNamespaceCollection">@namespace(<mtk-cps-selector-list
            selector-list-host="traceItem"
            ></mtk-cps-selector-list>)</div><!--
    --></div>
    <mtk-cps-rule
        style="padding-left: calc({{item[2].length}} * 1em)"
        item="item[1]"
        index="$index"
    ></mtk-cps-rule>
</li>
<ol>
