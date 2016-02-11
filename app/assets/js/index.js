var app = angular.module('App', ['ngSanitize', 'ui.select']);

app.filter('propsFilter', function () {
	return function (items, props) {
		var out = [];

		if (angular.isArray(items)) {
			items.forEach(function (item) {
				var itemMatches = false;

				var keys = Object.keys(props);
				for (var i = 0; i < keys.length; i++) {
					var prop = keys[i];
					var text = props[prop].toLowerCase();
					if (item[prop].toString().toLowerCase().indexOf(text) !== -1) {
						itemMatches = true;
						break;
					}
				}

				if (itemMatches) {
					out.push(item);
				}
			});
		} else {
			// Let the output be the input untouched
			out = items;
		}

		return out;
	};
});

app.controller('AppController', function ($scope) {
	$scope.selected = {};
	var filter_keys = ['country', 'sector', 'size', 'industry'];

	L.mapbox.accessToken = 'pk.eyJ1Ijoib2tmZGUiLCJhIjoiY2lpOHhvMnNhMDAyNnZla280ZWhmMm96NyJ9.IvGz74dvvukg19B4Npsm1g';
	var map = L.mapbox.map('map')
		.setView([52.5, 13.4], 4)
		.addLayer(L.mapbox.tileLayer('mapbox.light'));

	var credits = L.control.attribution({position: 'bottomleft'}).addTo(map).setPrefix('');
	credits.addAttribution("<a href='https://docs.google.com/spreadsheets/d/14A_AJkz2PFE_ZOhD_iq4jbAKl747QcpbdRlglOY3REI/export?format=tsv'>Download Data</a> | <a href='https://docs.google.com/forms/d/1486hog2LBoH_08BmZl1VU6bEcy1GdhGBZzQOyvQOfLM/formResponse'>Add your entry here</a>");

	var layerGroup = L.layerGroup().addTo(map);
	var data_layers = undefined;

	function collectFilters() {
		var filters = {};
		data_layers.eachLayer(function (layer) {
			filter_keys.forEach(function (s) {
				filters[s] = filters[s] || [];
				if (filters[s].indexOf(layer.feature.properties[s]) < 0)
					filters[s].push(layer.feature.properties[s]);
			});
			layer.bindPopup('<h2>' + layer.feature.properties.name + '</h2>' +
				(layer.feature.properties.url ?
				'<a target="_blank" href="' + (layer.feature.properties.url.indexOf('http') !== 0 ? 'http://' : '') + layer.feature.properties.url + '">' + layer.feature.properties.url + '</a><br/>'
					: '') +
				layer.feature.properties.industry + ', ' + layer.feature.properties.sector + ', ' + layer.feature.properties.size + '<br/>' +
				(layer.feature.properties.city ? layer.feature.properties.city + ', ' : '') + layer.feature.properties.country
			);
		});
		Object.keys(filters).forEach(function (key) {
			filters[key].sort(function (a, b) {
				if (a < b) return -1;
				if (a > b) return 1;
				return 0;
			});
			filters[key] = filters[key].map(function (o) {
				return {name: o};
			});
		});
		return filters;
	}

	function makeGroup(country, color) {
		return new L.MarkerClusterGroup({
			showCoverageOnHover: false,
			zoomToBoundsOnClick: false,
			singleMarkerMode: true,
			iconCreateFunction: function (cluster) {

				var childCount = cluster.getChildCount();

				var c = ' marker-cluster-';
				if (childCount < 10) {
					c += 'small';
				} else if (childCount < 100) {
					c += 'medium';
				} else {
					c += 'large';
				}

				return new L.DivIcon({html: '<div><span>' + childCount + '</span></div>', className: 'marker-cluster' + c, iconSize: new L.Point(40, 40)});
			}
		}).addTo(layerGroup);
	}

	function filterLayerProperties(props) {
		var keys = Object.keys($scope.selected);
		for (var i = 0; i < keys.length; i++) {
			var key = keys[i];
			var list = $scope.selected[key];
			if (list.length > 0) {
				if (list.map(function (o) {
						return o.name;
					}).indexOf(props[key]) < 0) {
					return false;
				}
			}
		}
		return true;
	}

	var group = {};
	var display = function () {
		layerGroup.clearLayers();
		if (!data_layers) return;
		group = {};
		data_layers.eachLayer(function (layer) {
			if (!filterLayerProperties(layer.feature.properties)) return;
			if (!group[layer.feature.properties.country]) {
				group[layer.feature.properties.country] = makeGroup(layer.feature.properties.country);
			}
			group[layer.feature.properties.country].addLayer(layer);
		});
	};

	L.mapbox.featureLayer()
		.loadURL('assets/data/features.json')
		.on('ready', function (e) {
			data_layers = e.target;
			display();
			var filters = collectFilters();
			$scope.$apply(function () {
				$scope.filters = filters;
			});
		});

	filter_keys.forEach(function (key) {
		$scope.selected[key] = [];
		$scope.$watch('selected.' + key, function (o) {
			display();
		});
	});

});
