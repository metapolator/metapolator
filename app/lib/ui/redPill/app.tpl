

<div class="children">
    <div class="masters">
        <label class="master-selection">select master:
            <select
                ng-model="currentMaster"
                ng-options="name for name in model.masters">
                </select>
        </label>
    
    
        <mtk-red-pill-master
            ng-repeat="name in [currentMaster] track by name"
            mtk-master-name="name" />
    </div><!--
    no whitespace in here!
    --><mtk-red-pill-glyphs></mtk-red-pill-glyphs>
</div>
