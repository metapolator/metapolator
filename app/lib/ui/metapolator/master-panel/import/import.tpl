<ol ng-if"$ctrl.items.length">
    <li
        class="current"
        ng-if="$ctrl.current"
        >
        <span title="{{$ctrl.current.file}}" class="name">{{$ctrl.current.file}}</span>
        <span class="current of total">{{$ctrl.current.i}} of {{$ctrl.current.total}}</span>
        <button ng-click="$ctrl.cancel($ctrl.current.file)" title="cancel">X</button>
        <div class="progress-bar" style="width: {{(100*$ctrl.current.i/$ctrl.current.total)}}%"></div>
    </li>
    <li
        class="scheduled"
        ng-repeat="file in $ctrl.items"
        >
        <span title="{{file}}" class="name">{{file}}</span>
        <span class="progress-waiting" title="waiting"></span>
        <button ng-click="$ctrl.cancel(file)" title="cancel">X</button>
    </li>
</ol>
