<mtk-local-menu class="localmenu lm-align-left">
    <div class="lm-head" ng-mousedown="localMenuCtrl.toggleMenu('lineHeight')">
        <div ng-if="model.lineHeightSetting != -1" class="lm-head-container">
            <img ng-src="../ui/metapolator/assets/img/{{options[model.lineHeightSetting].img}}" title="Amount of line spacing (leading) in em">
        </div>
        <div ng-if="model.lineHeightSetting == -1" class="lm-head-container">
            / <input class="lineheight-custom" ng-model="model.lineHeight" ng-focus="updateLineHeightCustom('blur')" ng-keyup="updateLineHeightCustom($event)">
        </div>
    </div>
    <div class="lm-body" ng-if="display.localMenu == 'lineHeight'">
        <div class="lm-button" ng-mouseup="changeLineHeightSetting($index)" ng-repeat="option in options track by $index" title="{{option.title}}">
            <div class="lm-checkmark"><span ng-if="$index == model.lineHeightSetting">H</span></div>{{option.name}}
        </div>
        <div class="lm-divider"></div>
        <div class="lm-button" ng-mouseup="changeLineHeightSetting(-1)">
            <div class="lm-checkmark"><span ng-if="model.lineHeightSetting == -1">H</span></div>Custom
        </div>
    </div>
</mtk-local-menu>