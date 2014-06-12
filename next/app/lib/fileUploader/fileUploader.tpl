<div ng-switch="{{requiredFeaturesAvailable}}">
	<div ng-switch-when="false"><h2>Required features are not supported by this browser.</h2><p>To use this application, upgrade your browser to the latest version.</p></div>
	<div ng-switcg-when="true">
	    <div class="uploader"><span ng-model="uploaderText">{{uploaderText}}</span></div>
	</div>
</div>