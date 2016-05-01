<mtk-local-menu class="localmenu lm-inside lm-align-right">
    <div class="lm-head" ng-mousedown="localMenuCtrl.toggleMenu('fontBy')">
        <div class="lm-head-container">
            Font by: {{model.fontBy}}
        </div>
    </div>
    <div class="lm-body" ng-if="display.localMenu == 'fontBy'">
        <div class="lm-button" ng-repeat="fontBy in fontBys" ng-mouseup="setFontBy(fontBy)">
            <div class="lm-checkmark"><span ng-if="fontBy === model.fontBy">H</span></div>{{fontBy}}
        </div>
    </div>

</mtk-local-menu>