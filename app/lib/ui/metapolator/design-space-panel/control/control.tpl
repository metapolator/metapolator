<div class="slider-input-container" 
     ng-repeat="axis in model.lastInstance.axes" 
     ng-style="{'top': ($index * axisDistance + (paddingTop + 46)) + 'px', 'left': (axisWidth / 2 - 25 + paddingLeft) + 'px'}">
    <input valuefield 
           id="designspace-input-{{$index}}" 
           counter="{{$index}}" 
           ng-model="axis.axisValue" 
           ng-blur="redrawAxesFromInput($index, 'blur')" 
           ng-keyup="redrawAxesFromInput($index, $event)">
</div>
<select class="slack-master-select" 
        ng-if="model.lastInstance.axes.length > 2"
        ng-change="changeSlackMaster()"
        ng-model="model.slack"
        ng-options="model.lastInstance.axes.indexOf(axis) as axis.master.displayName for (index, axis) in model.lastInstance.axes" 
        ng-style="{'top': (model.slack * axisDistance + (paddingTop + 28)) + 'px', 'left': '10px'}">
</select>