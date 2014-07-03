<div id="fileViwer" style="display:none">
    <input type="text" ng-model="search" placeholder="search" />
    <select ng-model="selectedFile" ng-options="file for file in filenames | filter: search"></select>
    <div id='ufoxml' display='none' class="highlight-module highlight-module--code highlight-module--left">
            <div class="highlight-module__container">
              <code class="html"><div class="highlight"><pre ng-bind="selectedFileContent"></pre></div></code>
            </div>
    </div>
    <div class="highlight-module highlight-module--right highlight-module--remember">
          <div class="highlight-module__container">
                <div id="ufoGlyph"></div>
          </div>
    </div>
</div>