var fs = require('fs');
var gulp = require('gulp');
var useref = require('gulp-useref');

gulp.task('assets-img', function () {
	gulp.src(['../app/assets/img/**/*'])
			.pipe(gulp.dest('../dist/assets/img'));
	gulp.src(['../app/assets/css/images/**/*'])
		.pipe(gulp.dest('../dist/assets/css/images'));
	return gulp.src(['../app/assets/bower_components/mapbox.js/images/**/*'])
		.pipe(gulp.dest('../dist/assets/css/images'));
});

gulp.task('assets-data', ['tsv2json'], function () {
	return gulp.src(['../app/assets/data/**/*'])
		.pipe(gulp.dest('../dist/assets/data'));
});

gulp.task('bundle', function () {
	return gulp.src('../app/*.html')
		.pipe(useref())
		.pipe(gulp.dest('../dist'));
});

gulp.task('tsv2json', function () {
	var destFile = '../app/assets/data/features.json';
	var srcFile = './data/OD5.4-database-deliverable - Sheet1.tsv';

// Collection of most used Cities geocoded for latitude/longitude
	var cities = JSON.parse(fs.readFileSync('./data/cities.json').toString());
// Collection of most used Countries geocoded for latitude/longitude
	var countries = JSON.parse(fs.readFileSync('./data/countries.json').toString());


	var getLatLngFromString = function (s) {
		var ll = s.split(',');
		return [parseFloat(ll[1]), parseFloat(ll[0])]
	};

	var findLatLng = function (city, country) {
		if (!city || city.length === 0) {
			if (countries[country]) {
				return getLatLngFromString(countries[country]);
			}
			console.log('no city, country not in list', country);
			return [0, 0];
		}
		var results = cities.filter(function (c) {
			return c.city.indexOf(city + ',') >= 0;
		});
		if (results.length == 1) {
			return getLatLngFromString(results[0].ll);
		}
		console.log('möp, city not found', city, country, results);
		return [0, 0];
	};

	var tsv = fs.readFileSync(srcFile).toString().split('\n');
	tsv.shift(); //strip header
	var list = [];
	tsv.forEach(function (line) {
		var cols = line.split('\t');
		var feature = {
			"type": "Feature",
			"geometry": {
				"coordinates": findLatLng(cols[6], cols[1]),
				"type": "Point"
			},
			properties: {
				name: cols[0],
				country: cols[1],
				sector: cols[2],
				group: cols[3],
				desc: cols[4],
				departments: cols[5],
				city: cols[6],
				year: cols[7],
				size: cols[8],
				id: cols[10],
				type: cols[11]
			}
		};
		list.push(feature);
	});
	fs.writeFileSync(destFile, JSON.stringify({
		"type": "FeatureCollection",
		"features": list
	}));
	console.log('All done, converted', list.length, 'entries');
});

gulp.task('default', ['tsv2json', 'bundle', 'assets-data', 'assets-img']);
