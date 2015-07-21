<button
    class="draghandle"
    ng-mousedown="resizeHeight($event)"
    ></button>
<h1>CPS-Panel</h1>

<mtk-cps-collection
    class="root"
    cps-collection="collection"

    mtk-dragover-autoscroll
    mtk-collection-drop
    mtk-collection-new-item

    ></mtk-cps-collection>
