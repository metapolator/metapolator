<mtk-menubar mtk-model="model" ng-mouseup="releaseLocalMenu($event)"></mtk-menubar>

<mtk-pagewrap ng-mouseup="releaseLocalMenu($event)">
    <mtk-landscape class="transition" ng-style="{'width': 'calc(' + (totalPanelParts / 16) + '* 100%)', 'left': getLandscapeLeft()}">
        <mtk-panel ng-style="{'width': 'calc(' + (panels[0].share / totalPanelParts) + '* 100%)'}">
            <div class="semi-panel">
                <mtk-parameter-panel class="panel"></mtk-parameter-panel>
            </div>
            <mtk-horizontal-divider></mtk-horizontal-divider>
            <div class="semi-panel without-border">
                <div class="under-construction"></div>
            </div>
        </mtk-panel>
        
        <mtk-panel ng-style="{'width': 'calc(' + (panels[1].share / totalPanelParts) + '* 100%)'}">
            <mtk-specimen-panel class="panel" mtk-model="model.masterSequences" mtk-type="'master'" mtk-rubberband="true" mtk-glyphrange="true"></mtk-specimen-panel>
        </mtk-panel>
        
        <mtk-panel ng-style="{'width': 'calc(' + (panels[2].share / totalPanelParts) + '* 100%)'}">
            <mtk-master-panel class="panel without-border" mtk-model="model"></mtk-master-panel>
        </mtk-panel>
        
        <mtk-panel ng-style="{'width': 'calc(' + (panels[3].share / totalPanelParts) + '* 100%)'}">
            <div class="semi-panel">
                <mtk-design-space-panel class="panel without-border" mtk-model="model"></mtk-design-space-panel>
            </div>
            <mtk-horizontal-divider></mtk-horizontal-divider>
            <div class="semi-panel">
                <mtk-specimen-panel class="panel" mtk-model="model.instanceSequences" mtk-type="'instance'" mtk-rubberband="false" mtk-glyphrange="false"></mtk-specimen-panel>
            </div>
        </mtk-panel>
        
        <mtk-panel ng-style="{'width': 'calc(' + (panels[4].share / totalPanelParts) + '* 100%)'}">
            <mtk-instance-panel class="panel without-border" mtk-model="model"></mtk-instance-panel>
        </mtk-panel>
        
        <mtk-panel class="without-body" ng-style="{'width': 'calc(' + (panels[5].share / totalPanelParts) + '* 100%)'}">
            <mtk-font-export-panel class="panel without-border" mtk-model="model.instancePanel"></mtk-font-export-panel>
        </mtk-panel>
        
        <mtk-panel ng-style="{'width': 'calc(' + (panels[6].share / totalPanelParts) + '* 100%)'}">
            <mtk-metadata-panel class="panel without-border" mtk-model=""></mtk-metadata-panel>
        </mtk-panel>
    </mtk-landscape>
</mtk-pagewrap>

<mtk-vertical-divider mtk-total-parts="totalParts" mtk-dividers="dividers" mtk-panels="panels" ng-repeat="divider in dividers" divider="{{$index}}" ng-if="divider.view === model.viewState"></mtk-vertical-divider>