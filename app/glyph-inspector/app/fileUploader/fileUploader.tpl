<div ng-switch="{{requiredFeaturesAvailable}}">
	<div ng-switch-when="false"><h2>Required features are not supported by this browser.</h2><p>To use this application, upgrade your browser to the latest version.</p></div>
	<div ng-switcg-when="true">
        <div class="highlight-module highlight-module--right highlight-module--remember">
          <div class="highlight-module__container">
            <div class="highlight-module__content   g-wide--pull-1  ">
              <p class="highlight-module__title">[ ]</p>
              <p class="highlight-module__text" ng-model="uploaderText" class="highlight-module__title">{{uploaderText}}</p>
            </div>
          </div>
        </div>
      </div>
</div>
