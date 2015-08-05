<mtk-local-menu class="localmenu lm-align-left">
    <div class="lm-head" ng-mousedown="localMenuCtrl.toggleMenu('specimenSamples')">
        <input ng-model="model.specimenSample.text" placeholder="Type text here..." ng-trim="false" ng-keyup="localMenuCtrl.closeMenu();">
    </div>
    <div class="lm-body" ng-if="display.localMenu == 'specimenSamples'">
        <div ng-repeat-start="specimenGroup in samples">
            <div class="lm-button" ng-repeat="specimen in specimenGroup" ng-mouseup="selectSpecimen(specimen)">
                <div class="lm-checkmark"><span ng-if="specimen == model.specimenSample">H</span></div>{{specimen.name}}
            </div>
        </div>
        <div ng-repeat-end class="lm-divider" ng-if="!$last"></div>
    </div>
</mtk-local-menu>