<mtk-local-menu class="localmenu lm-align-left">
    <div class="lm-head" ng-mousedown="localMenuCtrl.toggleMenu('specimenSamples')">
        <input ng-model="model.currentSample.text" placeholder="Type text here..." ng-trim="false" ng-keyup="localMenuCtrl.closeMenu(); model.parent.updateGlyphsIn();">
    </div>
    <div class="lm-body" ng-if="display.localMenu == 'specimenSamples'">
        <div ng-repeat-start="specimenCat in model.samples">
            <div class="lm-button" ng-repeat="specim in specimenCat" ng-mouseup="selectSpecimen(specim)">
                <div class="lm-checkmark"><span ng-if="specim == model.currentSample">H</span></div>{{specim.name}}
            </div>
        </div>
        <div ng-repeat-end class="lm-divider" ng-if="!$last"></div>
    </div>
</mtk-local-menu>