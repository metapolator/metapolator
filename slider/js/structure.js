app.controller("MetapolatorController", function($scope) {
	$scope.project = {
		projectName: "untitled document",
		display: {
			mode: ["glyphview", "paragraph", "", ""],
			fontsize: 40,
			lineHeight: 36			
		},
		parameters: [
			{
				type: "slant",
				operation: "*1.1"	
			}
		],
		sequences: [
			{
				name: "weight",
				paramters: [],
				masters: [
					{
						name: "master 1",
						type: "master",
						display: true,
						parameters: [],
						body: {
							glyphs: [
								{
									name: "a",
									parameters: [],
									skeleton: [],
									vector: []
								},
								{
									name: "b",
									parameters: [],
									skeleton: [],
									vector: []
								},
								{
									name: "c",
									parameters: [],
									skeleton: [],
									vector: []
								}
							]
						}
					},
					{
						name: "master 2",
						type: "master",
						display: false,
						parameters: [],
						body: {
							glyphs: [
								{
									name: "a",
									parameters: [],
									skeleton: [],
									vector: []
								},
								{
									name: "b",
									parameters: [],
									skeleton: [],
									vector: []
								},
								{
									name: "c",
									parameters: [],
									skeleton: [],
									vector: []
								}
							]
						}
					},
			{
				name: "width",
				parameters: [
					{
						type: "Direction in",
						operation: "=1"
					},
					{
						type: "Direction in max",
						operation: "2.0"
					}
				],
				masters: [
					{
						name: "master 3",
						type: "adjustment master",
						display: false,
						parameters: [],
						body: {
							glyphs: [
								{
									name: "a",
									parameters: [],
									skeleton: [],
									vector: []
								},
								{
									name: "b",
									parameters: [],
									skeleton: [],
									vector: []
								},
								{
									name: "c",
									parameters: [],
									skeleton: [],
									vector: []
								}
							]
						}
					},
					{
						name: "master 4",
						type: "master",
						display: false,
						parameters: [],
						body: {
							glyphs: [
								{
									name: "a",
									parameters: [],
									skeleton: [],
									vector: []
								},
								{
									name: "b",
									parameters: [],
									skeleton: [],
									vector: []
								},
								{
									name: "c",
									parameters: [],
									skeleton: [],
									vector: []
								}
							]
						}
					}
				
				]
			}
		],
		stringOfInstances: [
			{
				name: "string 1",
				instances: [
					{
						name: "instance 1",
						metadata: {
							metaData1: "",
							metaData2: "",
							metaData3: ""
						},
						metapolation: [
							{
								master: $scope.project.sequences[0].master[0],
								percentage: 4
							},
							{
								master: scope.project.sequences[0].master[1],
								percentage: 96
							}
						]
					},
					{
						name: "instance 2",
						metadata: {
							metaData1: "",
							metaData2: "",
							metaData3: ""
						},
						metapolation: [
							{
								master: $scope.project.sequences[0].master[0],
								percentage: 78
							},
							{
								master: scope.project.sequences[0].master[1],
								percentage: 22
							}
						]
					}
				]
			}
		]
	}
});
