<h2>Master: <em>{{ master }}</em></h2>

<!--
<label>edit Mode:
    <select ng-model="data.mode" 
            ng-options="name for name in modes"
            ></select>
</label>
-->

<div class="controls" ng-switch on="data.mode">
      <div ng-switch-when="rules">rules mode, placeholder</div>
      <mtk-files-mode ng-switch-when="files">files mode placeholder</mtk-files-mode>
      <div ng-switch-default>This is the "default" item and shoul NEVER appear on screen.</div>
</div>
