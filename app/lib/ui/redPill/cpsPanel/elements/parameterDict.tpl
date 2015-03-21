hello world! this is a cps-parameter-dict

<div style="font-family:monospace;white-space:pre">
{{ cpsParameterDict.toString(); }}


// ALSO: there are several item types in a cpsParameterDict!
// comments, maybe unparsable objects (GenericCPSNode) and the valid/invalid parameters
for each item // <- add id's to track changes
if item is a parameter
        &lt;cps-parameter cps-parameter="cpsParameter"&gt;
    else
        item.toString

<!-- I think angular will be bad at this.
    Important will be to check the behavior with updates etc.
    - Is the cpsParameterDict.items read too often, it's a propety getter ...
    - Are the items updated propoerly? How does track by index manage this?

    -- id should be something like index+(type+)stringValue
    // dunno if type is needed, another string value would result in another type
    // maybe that doubtful nodeId+index is bery good here!
-->
<ol>
    <li ng-repeat="item in cpsParameterDict.items track by $index" ng-switch="item.constructor.name">
        <cps-parameter ng-switch-when="Parameter"  cps-parameter="item"></cps-parameter>
        <span ng-switch-default>{{item.constructor.name}}:: {{item.toString()}}</span>
    </li>
</ol>
</div>
