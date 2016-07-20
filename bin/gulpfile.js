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
	var srcFile = './data/data.tsv';

// Collection of most used Cities geocoded for latitude/longitude
	var cities = JSON.parse(fs.readFileSync('./data/cities.json').toString());
// Collection of most used Countries geocoded for latitude/longitude
	var countries = JSON.parse(fs.readFileSync('./data/countries.json').toString());


	var getLatLngFromString = function (s) {
		var ll = s.split(',');
		return [parseFloat(ll[1]), parseFloat(ll[0])]
	};

	var findLatLng = function (city, country, full) {
		if (!city || city.length === 0) {
			if (countries[country]) {
				return getLatLngFromString(countries[country]);
			}
			console.log('no city, country not in list', country, full);
			return [0, 0];
		}
		var results = cities.filter(function (c) {
			return c.city.indexOf(city + ',') >= 0;
		});
		if (results.length == 1) {
			return getLatLngFromString(results[0].ll);
		}
		var parts = city.split(',');
		var maybeparts = parts.filter(function (p) {
			p = p.trim();
			var r = cities.filter(function (c) {
				return c.city.indexOf(p + ',') == 0;
			});
			return r.length > 0;
		});
		if (maybeparts.length == 1) {
			results = cities.filter(function (c) {
				return c.city.indexOf(maybeparts[0].trim() + ',') == 0;
			});
		}
		if (results.length == 1) {
			return getLatLngFromString(results[0].ll);
		}
		console.log('maybeparts', maybeparts);

		console.log('möp, city not found', city, country, results);
		return [0, 0];
	};

	var prepareCol = function (s) {
		return (s || '').trim();
	};

	var tsv = fs.readFileSync(srcFile).toString().split('\n');
	tsv.shift(); //strip header
	var list = [];
	tsv.forEach(function (line) {
		if (line.trim().length == 0) return;
		var cols = line.split('\t');
		var feature = {
			"type": "Feature",
			"geometry": {
				"coordinates": findLatLng(prepareCol(cols[6]), prepareCol(cols[1]), cols),
				"type": "Point"
			},
			properties: {
				name: prepareCol(cols[0]),
				country: prepareCol(cols[1]),
				sector: prepareCol(cols[2]),
				industry: prepareCol(cols[3]),
				desc: prepareCol(cols[4]),
				departments: prepareCol(cols[5]),
				city: prepareCol(cols[6]),
				year: prepareCol(cols[7]),
				size: prepareCol(cols[8]),
				url: prepareCol(cols[9]),
				odsets: prepareCol(cols[10]),
				tw: prepareCol(cols[11]),
				financials: prepareCol(cols[12])
			}
		};
		list.push(feature);
	});
	fs.writeFileSync(destFile, JSON.stringify({
		"type": "FeatureCollection",
		"features": list
	}));
	//console.log('All done, converted', list.length, 'entries');
});

gulp.task('default', ['tsv2json', 'bundle', 'assets-data', 'assets-img']);
