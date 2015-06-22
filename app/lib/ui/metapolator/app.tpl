<mtk-menubar mtk-model="model" ng-mouseup="releaseLocalMenu($event)"></mtk-menubar>

<mtk-pagewrap ng-mouseup="releaseLocalMenu($event)">
    <mtk-landscape class="transition" ng-style="{'width': 'calc(' + (model.display.panel.totalPanelParts / 16) + '* 100%)', 'left': getLandscapeLeft()}">
        <mtk-panel ng-style="{'width': 'calc(' + (model.display.panel.panels[0].share / model.display.panel.totalPanelParts) + '* 100%)'}">
            <div class="semi-panel">
                <mtk-parameter-panel class="panel" mtk-model="model.masterPanel"></mtk-parameter-panel>
            </div>
            <mtk-horizontal-divider></mtk-horizontal-divider>
            <div class="semi-panel without-border">
                <div class="under-construction"></div>
            </div>
        </mtk-panel>
        
        <mtk-panel ng-style="{'width': 'calc(' + (model.display.panel.panels[1].share / model.display.panel.totalPanelParts) + '* 100%)'}">
            <mtk-specimen-panel class="panel" mtk-model="model.specimen1"></mtk-specimen-panel>
        </mtk-panel>
        
        <mtk-panel ng-style="{'width': 'calc(' + (model.display.panel.panels[2].share / model.display.panel.totalPanelParts) + '* 100%)'}">
            <mtk-master-panel class="panel without-border" mtk-model="model.masterPanel"></mtk-master-panel>
        </mtk-panel>
        
        <mtk-panel ng-style="{'width': 'calc(' + (model.display.panel.panels[3].share / model.display.panel.totalPanelParts) + '* 100%)'}">
            <div class="semi-panel">
                <mtk-design-space-panel class="panel without-border" mtk-model="model.designSpacePanel"></mtk-design-space-panel>
            </div>
            <mtk-horizontal-divider></mtk-horizontal-divider>
            <div class="semi-panel">
                <mtk-specimen-panel class="panel" mtk-model="model.specimen2"></mtk-specimen-panel>
            </div>
        </mtk-panel>
        
        <mtk-panel ng-style="{'width': 'calc(' + (model.display.panel.panels[4].share / model.display.panel.totalPanelParts) + '* 100%)'}">
            <mtk-instance-panel class="panel without-border" mtk-model="model.instancePanel"></mtk-instance-panel>
        </mtk-panel>
        
        <mtk-panel class="without-body" ng-style="{'width': 'calc(' + (model.display.panel.panels[5].share / model.display.panel.totalPanelParts) + '* 100%)'}">
            <mtk-font-export-panel class="panel without-border" mtk-model="model.instancePanel"></mtk-font-export-panel>
        </mtk-panel>
        
        <mtk-panel ng-style="{'width': 'calc(' + (model.display.panel.panels[6].share / model.display.panel.totalPanelParts) + '* 100%)'}">
            <mtk-metadata-panel class="panel without-border" mtk-model=""></mtk-metadata-panel>
        </mtk-panel>
    </mtk-landscape>
</mtk-pagewrap>

<mtk-vertical-divider mtk-model="model.display.panel" ng-repeat="divider in model.display.panel.dividers" divider="{{$index}}" ng-if="divider.view == model.display.panel.viewState"></mtk-vertical-divider>

<mtk-dialog mtk-model="model.display.dialog"></mtk-dialog>