<label>select files:
    <select 
            multiple
            ng-model="data.files" 
            ng-options="name for name in {{ sources }}"
            ></select>
</label>

<ol>
    <li ng-repeat="source in data.files track by source">
        <span>file: {{ source }}</span>
        <!--
            Don't use ng-model here. the history of the resulting doc
            will have ther instertion of the content as first entry.
            Also the change event will fire immediately. We create the
            doc in codemirrors on load event.
        -->
        <ui-codemirror
            ui-codemirror-opts="getEditorOptions(source)"
            ng-controller="CodeMirrorController"
            ></ui-codemirror>
    </li>
</ol>
