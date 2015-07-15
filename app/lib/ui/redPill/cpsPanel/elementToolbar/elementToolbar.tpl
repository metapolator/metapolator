</div><!--
--><mtk-drag-handle draggable="true"></mtk-drag-handle><!-- if drag???
--><mtk-cps-toolbutton
        ng-repeat="tool in mtkTools"
        class="tool-{{tool}}"
        title={{tool}}
        ng-click="mtkClickHandler($event, tool)"
        >{{tool}}</mtk-cps-toolbutton><!--
--></div>
