<label>Files:
    <select 
            multiple
            ng-model="data.files" 
            ng-options="name for name in {{ modelController.sources }}"
            ></select>
</label>



<ol>
    <li ng-repeat="source in data.files">
        <ui-codemirror
            ui-codemirror-opts="editorOptions"
            ng-init="content = modelController.getSourceStringByName(source)"
            ng-model="content"
            ></ui-codemirror>
    <hr />
    </li>
</ol>
