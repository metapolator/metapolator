hello world! this is a cps-property-dict

<div style="font-family:monospace;white-space:pre">
{{ cpsPropertyDict.toString(); }}


// ALSO: there are several item types in a cpsPropertyDict!
// comments, maybe unparsable objects (GenericCPSNode) and the valid/invalid propertys
for each item // <- add id's to track changes
if item is a property
        &lt;cps-property cps-property="cpsProperty"&gt;
    else
        item.toString

<!-- I think angular will be bad at this.
    Important will be to check the behavior with updates etc.
    - Is the cpsPropertyDict.items read too often, it's a propety getter ...
    - Are the items updated propoerly? How does track by index manage this?

    -- id should be something like index+(type+)stringValue
    // dunno if type is needed, another string value would result in another type
    // maybe that doubtful nodeId+index is bery good here!
-->
<ol>
    <li ng-repeat="item in cpsPropertyDict.items track by $index" ng-switch="item.constructor.name">
        <mtk-cps-property ng-switch-when="Property"  cps-property="item"></mtk-cps-property>
        <span ng-switch-default>{{item.constructor.name}}:: {{item.toString()}}</span>
    </li>
</ol>
</div>
