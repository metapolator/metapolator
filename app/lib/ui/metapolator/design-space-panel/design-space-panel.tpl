<ul id="design-space-tabs">
    <li ng-repeat="space in model.designSpaces track by space.id" ng-class="{'selected' : space == model.currentDesignSpace}" ng-click="selectDesignSpace(space)">
        <mtk-local-menu class="localmenu lm-inside lm-align-right" ng-if="space == model.currentDesignSpace">
            <div class="lm-head" ng-mousedown="localMenuCtrl.toggleMenu('designSpace')">
                <div class="lm-head-container">
                    <div mtk-rename="space.name"></div>&nbsp;
                </div>
            </div>
            <div class="lm-body" ng-if="display.localMenu == 'designSpace'">
                <div class="lm-button" ng-mouseup="addDesignSpace(); localMenuCtrl.closeMenu()">New</div>
                <div class="lm-button" ng-mouseup="cloneDesignSpace(); localMenuCtrl.closeMenu()">Duplicate</div>
                <div class="lm-divider"></div>
                <div class="lm-button" ng-mouseup="removeDesignSpace(); localMenuCtrl.closeMenu()">Delete…</div>
            </div>
        </mtk-local-menu>
        <div mtk-rename="space.name" ng-if="space != model.currentDesignSpace"></div>
    </li>
    <li class="add-design-space" ng-click="addDesignSpace()" ng-if="model.designSpaces.length < 8">
        +
    </li>
</ul>

<div class="design-space">
    <mtk-control mtk-model="model.currentDesignSpace" ng-class="{'logo-bg': model.currentDesignSpace.axes.length == 0}" class="drop-area" ng-if="model.currentDesignSpace.type == 'Control'"></mtk-control>
    <mtk-explore mtk-model="model.currentDesignSpace" class="drop-area" ng-if="model.currentDesignSpace.type == 'Explore'"></mtk-explore>
</div>