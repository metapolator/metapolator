<div id="fileViwer" style="display:none;">
    <div id="glyph-select" class="g-medium--half">
        <input type="text" ng-model="search" placeholder="search" />
        <select ng-model="selectedFile" ng-options="file for file in filenames | filter: search"></select>
    </div>
    <div id='ufoxml' display='none' class="highlight-module highlight-module--code highlight-module--left g-wide--2">
            <div class="highlight-module__container">
              <code class="html g-wide--3"><div class="highlight"><pre ng-bind="selectedFileContent"></pre></div></code>
            </div>
    </div>
    <div class="highlight-module highlight-module--right highlight-module--remember">
          <div class="highlight-module__container">
                <div id="ufoGlyph"></div>
          </div>
    </div>
</div>