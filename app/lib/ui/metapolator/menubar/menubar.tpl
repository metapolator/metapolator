<div id="project">
    <mtk-local-menu class="localmenu">
        <div class="lm-head" ng-mousedown="localMenuCtrl.toggleMenu('project')">
            <b>Project</b> <span id="project-name" mtk-rename="model.projectName"></span>
        </div>
        <div class="lm-body" ng-if="display.localMenu == 'project'">
            <div class="lm-button" ng-mouseup="newDocument()">New</div>
            <div class="lm-divider"></div>
            <div class="lm-button" ng-mouseup="renameProject()">Rename Project</div>
            <div class="lm-divider"></div>
            <div class="lm-button" ng-mouseup="closeDocument()">Close</div>
        </div>
    </mtk-local-menu>
</div>

<div class="view-buttons">
    <div ng-repeat="menuItem in model.display.panel.menuItems" 
         ng-click="model.display.panel.viewState = $index" 
         class="menu-item" 
         ng-class="{'menu-item-current': $index == model.display.panel.viewState }">
        {{menuItem}}
    </div>
</div>

<div id="help">
    <mtk-local-menu class="localmenu lm-align-right">
        <div class="lm-head" ng-mousedown="localMenuCtrl.toggleMenu('help')">
            <b>Help</b>
        </div>
        <div class="lm-body" ng-if="display.localMenu == 'help'">
            <div style="text-align:center">Each opens in a new tab</div>
            <div class="lm-divider"></div>
            <div class="lm-button"><a title="Github is a great project collaboration system" href="https://github.com/metapolator/metapolator" target="_blank">Github Project</a></div>
            <div class="lm-button"><a title="Frequently Asked Questions answered on the project wiki" href="https://github.com/metapolator/metapolator/wiki/faq" target="_blank">FAQ</a></div>
            <div class="lm-button"><a title="Browse existing feature requests and bug reports on Github" href="https://github.com/metapolator/metapolator/issues" target="_blank">Github Issues</a></div>
            <div class="lm-button"><a title="Report a bug or request a feature by creating a new issue on Github" href="https://github.com/metapolator/metapolator/issues/new" target="_blank">New Issue</a></div>
            <div class="lm-divider"></div>
            <div class="lm-button"><a title="Homepage" href="https://metapolator.com" target="_blank">metapolator.com</a></div>
            <div class="lm-button"><a title="Follow us on Twitter" href="https://twitter.com/metapolator" target="_blank">@metapolator</a></div>
            <div class="lm-button"><a title="To ask questions about usage or anything in general, post on our G+ Community page" href="https://plus.google.com/communities/110027004108709154749" target="_blank">+Metapolator</a></b></div>
            <div class="lm-divider"></div>
            <div class="lm-button"><form id="help-paypal" action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_blank"><a title="Give financial support via Paypal" href="javascript:{}" onclick="document.getElementById('help-paypal').submit(); return false;">Donate</a><input type="hidden" name="cmd" value="_s-xclick"><input type="hidden" name="hosted_button_id" value="CMQZM2FJDP4VA"></form></div>
            <div class="lm-button"><a title="Support the project with a T shirt (USA)" href="http://teespring.com/metapolator-beta-0-3-0" target="_blank">Buy T Shirts (USA)</a></div>
            <div class="lm-button"><a title="Support the project with a T shirt (EU)" href="http://metapolator.spreadshirt.com" target="_blank">Buy T Shirts (EU)</a></div>
            <div class="lm-divider"></div>
            <div class="lm-button"><a title="To look behind the curtain and see the true underlying reality, take the red pill" href="http://metapolator.com/red-pill-demo/" target="_blank">Technology Demo</a></b></div>
            </div>
        </div>
    </mtk-local-menu>
</div>

<div id="name-and-version">
    Metapolator Beta 0.3.devel
</div>