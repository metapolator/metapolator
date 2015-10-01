<mtk-menubar mtk-model="model" ng-mouseup="releaseLocalMenu($event)"></mtk-menubar>

<mtk-pagewrap ng-mouseup="releaseLocalMenu($event)">
    <mtk-landscape class="transition" ng-style="{'width': 'calc(' + (totalPanelParts / 16) + '* 100%)', 'left': getLandscapeLeft()}">
        <mtk-panel ng-style="{'width': 'calc(' + (panels[0].share / totalPanelParts) + '* 100%)'}">
            <div class="semi-panel">
                <mtk-parameter-panel class="panel"></mtk-parameter-panel>
            </div>
            <mtk-horizontal-divider></mtk-horizontal-divider>
            <div class="semi-panel without-border">
                <div class="under-construction">
                    <div class="bottom-text">
                        Coming Soon:<br>More Parameters<br><br>
                        Want more parameters, including point parameters for fine-tuning? Support the project and buy a T shirt (<a title="Support the project and buy a T shirt (USA)" href="http://teespring.com/metapolator-beta-0-3-0" target="_blank" class="newtab">USA</a>, <a title="Support the project and buy a T shirt (Worldwide)" href="http://metapolator.spreadshirt.com" target="_blank" class="newtab">Worldwide</a>)
                    </div>
                </div>
            </div>
        </mtk-panel>
        
        <mtk-panel ng-style="{'width': 'calc(' + (panels[1].share / totalPanelParts) + '* 100%)'}">
            <mtk-specimen-panel class="panel" mtk-model="model.masterSequences" mtk-type="'master'" mtk-rubberband="true" mtk-glyphrange="true"></mtk-specimen-panel>
        </mtk-panel>
        
        <mtk-panel ng-style="{'width': 'calc(' + (panels[2].share / totalPanelParts) + '* 100%)'}">
            <div class="semi-panel">
                <mtk-master-panel class="panel without-border" mtk-model="model"></mtk-master-panel>
            </div>
            <mtk-horizontal-divider></mtk-horizontal-divider>
            <div class="semi-panel without-border">
                <div class="under-construction">
                    <div class="bottom-text">
                        Coming Soon:<br>Adjustment Masters<br><br>
                        <!-- Pinterest -->
                        <a href="//www.pinterest.com/pin/create/button/" data-pin-do="buttonBookmark" ><img src="//assets.pinterest.com/images/pidgets/pinit_fg_en_rect_gray_20.png" /></a>
                        <!-- Facebook -->
                        <div class="fb-share-button" data-href="https://metapolator.com/purple-pill/" data-layout="button_count"></div>
                        <!-- Twitter -->
                        <a class="twitter-share-button"
                           href="https://twitter.com/share"
                           data-url="https://metapolator.com/purple-pill/"
                           data-via="metapolator">
                            Tweet
                        </a>
                        <!-- G+ -->
                        <div class="g-plusone" data-size="medium"></div>
                        <div style="display:inline">
                            <!-- Github Star -->
                            <iframe src="https://ghbtns.com/github-btn.html?user=metapolator&repo=metapolator&type=star&count=true" frameborder="0" scrolling="0" width="90px" height="20px"></iframe>
                            <!-- Github Watch -->
                            <iframe src="https://ghbtns.com/github-btn.html?user=metapolator&repo=metapolator&type=watch&count=true&v=2" frameborder="0" scrolling="0" width="90px" height="20px"></iframe>
                        </div>
                    </div>
                </div>
            </div>
        </mtk-panel>
        
        <mtk-panel ng-style="{'width': 'calc(' + (panels[3].share / totalPanelParts) + '* 100%)'}">
            <div class="semi-panel">
                <mtk-design-space-panel class="panel without-border" mtk-model="model"></mtk-design-space-panel>
            </div>
            <mtk-horizontal-divider></mtk-horizontal-divider>
            <div class="semi-panel">
                <mtk-specimen-panel class="panel" mtk-model="model.instanceSequences" mtk-type="'instance'" mtk-rubberband="false" mtk-glyphrange="false"></mtk-specimen-panel>
            </div>
        </mtk-panel>
        
        <mtk-panel ng-style="{'width': 'calc(' + (panels[4].share / totalPanelParts) + '* 100%)'}">
            <mtk-instance-panel class="panel without-border" mtk-model="model"></mtk-instance-panel>
        </mtk-panel>
        
        <mtk-panel class="without-body" ng-style="{'width': 'calc(' + (panels[5].share / totalPanelParts) + '* 100%)'}">
            <mtk-font-export-panel class="panel without-border" mtk-model="model.instancePanel"></mtk-font-export-panel>
        </mtk-panel>
        
        <mtk-panel ng-style="{'width': 'calc(' + (panels[6].share / totalPanelParts) + '* 100%)'}">
            <mtk-metadata-panel class="panel without-border" mtk-model="">
            </mtk-metadata-panel>
        </mtk-panel>
    </mtk-landscape>
</mtk-pagewrap>

<mtk-vertical-divider mtk-total-parts="totalParts" mtk-dividers="dividers" mtk-panels="panels" ng-repeat="divider in dividers" divider="{{$index}}" ng-if="divider.view === model.viewState"></mtk-vertical-divider>