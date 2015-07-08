<mtk-local-menu class="localmenu">
    <div class="lm-head" ng-mousedown="localMenuCtrl.toggleMenu('font-export')">
        Fonts
    </div>
    <div class="lm-body" ng-if="display.localMenu == 'font-export'">
        <div class="lm-button" ng-class="{'inactive': model.sequences[0].children.length == 0}" ng-mouseup="checkAll(true)">Check All</div>
        <div class="lm-button" ng-class="{'inactive': model.sequences[0].children.length == 0}" ng-mouseup="checkAll(false)">Uncheck All</div>
    </div>
</mtk-local-menu>
