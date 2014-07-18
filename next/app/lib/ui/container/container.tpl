<h3>»{{model.name}}«</h3><button ng-click="model.more()">Add a widget</button>
<ol >
    <mtk-widget
        ng-repeat="item in model.widgets"
        in-index="$index"
        mtk-model="model.widgets[$index]" /><!-- mtk-model="model.widget[{{$index}}]" -->
</ol>
