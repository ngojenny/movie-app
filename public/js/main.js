'use strict';

var app = {};

//store their input in a VAR (set default to 2016)
// pass that variable in our getdata method -in primary_release_year key
//make multiple ajax calls for pages 1 and 2

//get data back and put all the movie objects in one array
// reorganize objects in array from highest average
//then extract the top 10 highest average and put them in another array
//write a function to display movie posters
//"https://image.tmdb.org/t/p/original/" + object.poster_path

// create an array of top 10 movie IDs
//films using 10 ajax calls
// use /movie/[id]/credits/ endpoint to take top 3 cast from all 10
//use on click function on movie poster >> expand display more info box
//populate/display title, vote_average, poster_path, overview, cast (from cast array)

// USERS FORM SELECTION & SUBMIT  //
//-------------------------------//

app.init = function () {
	app.alreadyPicked = false;
	app.getAllYears();

	var lastYear = new Date().getFullYear() - 1;
	if (lastYear) {
		app.getData(lastYear);
	}

	var releaseYearElements = document.querySelectorAll('#releaseYearDropdown option');
	releaseYearElements.forEach(function (option) {
		if (option.value === lastYear.toString()) {
			option.selected = true;
		}
	});

	$('select').on('change', function () {
		app.alreadyPicked = true;
		$('#movieBox').empty();
		$('#loadingAnimation').removeClass('hidden');
		var year = $('select').val();

		app.getData(year);
	});
};

// automatically generate years from current year to 2000;

app.getAllYears = function () {
	var currentYear = new Date().getFullYear();
	var yearArray = [];

	for (var i = currentYear; i >= 1980; i--) {
		yearArray.push('<option value="' + i + '">' + i + '</option>');
	}

	$('#releaseYearDropdown').append(yearArray);
};

app.getData = function (year) {

	var page1 = $.ajax({
		url: 'http://api.themoviedb.org/3/discover/movie',
		method: 'GET',
		dataType: 'jsonp',
		data: {
			api_key: 'f43968b7420dc8dd5dc5be75cb2d3725',
			sort_by: 'vote_count.desc',
			page: '1',
			primary_release_year: year

		}
	});

	var page2 = $.ajax({
		url: 'http://api.themoviedb.org/3/discover/movie',
		method: 'GET',
		dataType: 'jsonp',
		data: {
			api_key: 'f43968b7420dc8dd5dc5be75cb2d3725',
			sort_by: 'vote_count.desc',
			page: '2',
			primary_release_year: year
		}
	});

	$.when(page1, page2).done(function (results1, results2) {
		var moviesPage1 = results1[0].results;
		var moviesPage2 = results2[0].results;
		app.combinePages(moviesPage1, moviesPage2);
	});
};

//this function that will concat the top 20 movies from page 1 and two into one array with 40 movie objects

app.combinePages = function (pg1, pg2) {
	var combinedPgsArray = pg1.concat(pg2);
	app.sortArray(combinedPgsArray);
};

//this function will sort the array of 40 movie objects from highest vote average to lowest
app.sortArray = function (combinedPgsArray) {
	function compare(a, b) {
		if (a.vote_average > b.vote_average) return -1;else if (a.vote_average < b.vote_average) return 1;else return 0;
	}
	var topMovies = combinedPgsArray.sort(compare);
	app.topTen(topMovies);
};

//this function will pull the top ten/first ten objects in array

app.topTen = function (topMovies) {
	var topTenMovies = topMovies.slice(0, 10);

	app.displayTopTen(topTenMovies);
};

//this function will pull out the poster_path from the 10 objects within the array.
//we will concat the value from the poster_path key with the rest of the image URL
// to make the src for the images
app.displayTopTen = function (movies) {
	movies.forEach(function (displayTopTen) {
		var posterLink = 'https://image.tmdb.org/t/p/original' + displayTopTen.poster_path;
		var img = $('<img>').addClass('moviePoster').attr('src', posterLink).data('movieObject', displayTopTen);
		$('#movieBox').append(img);
	});

	var $posters = $('#movieBox').find('img');
	var count = $posters.length;
	var loadedPosters = 0;

	$posters.on('load', function () {
		loadedPosters++;
		if (loadedPosters === 1) {
			//scroll to movie box once some things are loaded
			if (app.alreadyPicked) {
				$.smoothScroll({
					scrollTarget: '#movieBox',
					speed: 1000
				});
			}
		}
		if (loadedPosters === count) {
			//remove loading animation once things are loaded
			$('#loadingAnimation').addClass('hidden');
		}
	});

	app.displayMoreInfo();
};

app.displayMoreInfo = function (singleMovie) {

	$('#movieBox').on('click', 'img:nth-child(-n+5)', function () {
		var movieInfo = $(this).data('movieObject');
		$('.moreInfo').remove();
		var screen = $(window);

		if (screen.width() < 480) {
			$('<div>').addClass('moreInfo moreInfoTop').insertAfter(event.target);
		} else {
			$('<div>').addClass('moreInfo moreInfoTop').insertAfter('img:nth-of-type(5)');
		};

		$('.moreInfoTop').append($('<div>').addClass('infoPoster'));
		$('.moreInfoTop').append($('<div>').addClass('infoContent'));
		$('.moreInfoTop').append($('<div>').addClass('closeMoreInfo'));

		var movieTitle = $('<h3>').text(movieInfo.title);
		var moviePoster = 'https://image.tmdb.org/t/p/original' + movieInfo.poster_path;
		var img = $('<img>').addClass('infoMoviePoster').attr('src', moviePoster);
		var description = $('<p>').text(movieInfo.overview);
		var userRating = $('<p>').text(movieInfo.vote_average + "/10");
		var viewTrailer = $('<p>').addClass('btn').text("View trailer");
		var closeSym = $('.closeMoreInfo').html('<i class="fa fa-times" aria-hidden="true"></i>');

		$('.infoPoster').append(img);
		$('.infoContent').append(movieTitle, userRating, description, viewTrailer);

		$.smoothScroll({
			scrollTarget: '.moreInfoTop',
			speed: 600
		});

		var nameArray = [];
		var castNameArray;
		var movieID = movieInfo.id;

		//MAKE AJAX REQUEST TO GRAB CAST & DIRECTOR INFO
		$.ajax({
			url: 'http://api.themoviedb.org/3/movie/' + movieID + '/credits',
			method: 'GET',
			dataType: 'jsonp',
			data: {
				api_key: 'f43968b7420dc8dd5dc5be75cb2d3725'
			}
		}).then(function (res) {
			var castObjectArray = res.cast;
			var slicedCast = castObjectArray.slice(0, 4);
			var castArray = slicedCast.forEach(function (castObject) {
				nameArray.push(castObject.name);
			});
			castNameArray = nameArray.join(', ');
			$('<p>').text('Starring: ' + castNameArray).insertBefore(description);
			var crewObjectArray = res.crew;

			var directors = [];
			var directorsString = '';

			//Get director info and display on page
			var getDirector = crewObjectArray.forEach(function (castObject) {
				if (castObject.job === "Director") {
					directors.push(castObject.name);
				}
			});

			//handle multiple directors
			if (directors.length > 1) {
				directorsString = directors.join(', ');
			} else {
				directorsString = directors[0];
			}

			$('<p>').text('Director: ' + directorsString).insertAfter(userRating);
		});
		closeDiv();
		app.getTrailers(movieID);
	});

	$('#movieBox').on('click', 'img:nth-child(n+6)', function () {
		var movieInfo = $(this).data('movieObject');
		$('.moreInfo').remove();
		var screen = $(window);

		if (screen.width() < 480) {
			$('<div>').addClass('moreInfo moreInfoBottom').insertAfter(event.target);
		} else {
			$('<div>').addClass('moreInfo moreInfoBottom').insertAfter('img:nth-of-type(10)');
		};

		$('.moreInfoBottom').append($('<div>').addClass('infoPoster'));
		$('.moreInfoBottom').append($('<div>').addClass('infoContent'));

		$('.moreInfoBottom').append($('<div>').addClass('closeMoreInfo'));

		var movieTitle = $('<h3>').text(movieInfo.title);
		var moviePoster = 'https://image.tmdb.org/t/p/original' + movieInfo.poster_path;
		var img = $('<img>').addClass('infoMoviePoster').attr('src', moviePoster);
		var description = $('<p>').text(movieInfo.overview);
		var userRating = $('<p>').text(movieInfo.vote_average + "/10");
		var viewTrailer = $('<p>').addClass('btn').text("View trailer");

		var closeSym = $('.closeMoreInfo').html('<i class="fa fa-times" aria-hidden="true"></i>');
		$('.infoPoster').append(img);
		$('.infoContent').append(movieTitle, userRating, description, viewTrailer);
		$.smoothScroll({
			scrollTarget: '.moreInfoBottom',
			speed: 600
		});

		var nameArray = [];
		var castNameArray;
		var movieID = movieInfo.id;

		//MAKE AJAX REQUEST TO GRAB CAST AND DIRECTOR INFO
		$.ajax({
			url: 'http://api.themoviedb.org/3/movie/' + movieID + '/credits',
			method: 'GET',
			dataType: 'jsonp',
			data: {
				api_key: 'f43968b7420dc8dd5dc5be75cb2d3725'
			}
		}).then(function (res) {
			var castObjectArray = res.cast;
			var slicedCast = castObjectArray.slice(0, 4);
			var castArray = slicedCast.forEach(function (castObject) {
				nameArray.push(castObject.name);
			});
			castNameArray = nameArray.join(', ');
			$('<p>').text('Starring: ' + castNameArray).insertBefore(description);
			var crewObjectArray = res.crew;

			//Get director info and display on page
			var getDirector = crewObjectArray.forEach(function (castObject) {
				if (castObject.job === "Director") {
					var director = castObject.name;
					$('<p>').text('Director: ' + director).insertAfter(userRating);
				}
			});
		});

		closeDiv();
		app.getTrailers(movieID);
	});
};

function closeDiv() {
	$('.closeMoreInfo').on('click', function () {
		$('.moreInfo').remove();
	});
}

app.getTrailers = function (movieID) {
	$('p.btn').on('click', function () {
		$.ajax({
			url: 'http://api.themoviedb.org/3/movie/' + movieID + '/videos',
			method: 'GET',
			dataType: 'jsonp',
			data: {
				api_key: 'f43968b7420dc8dd5dc5be75cb2d3725'
			}
		}).then(function (res) {
			var errorMsg = '<p class="small">Oops! This trailer is currently not available, please check another movie.</p>';
			if (!res.results[0]) {
				$('.infoContent').append(errorMsg);
			}
			var youTubeKey = res.results[0].key;
			app.displayTrailer(youTubeKey);
		});
	});
};

$('.close').on('click', function () {
	$('.movieBox').remove();
});

//This function will append the specific trailer on the page
app.displayTrailer = function (youTubeKey) {
	$('iframe').remove();
	var videoFrame = '<iframe id="ytplayer" type="text/html" width="640" height="390" src="https://www.youtube.com/embed/' + youTubeKey + '?autoplay=1' + 'frameborder="0" allowfullscreen/>';

	$('.moreInfo').append('<div class="showTrailer"></div>');
	$('.showTrailer').append(videoFrame);
	app.hideTheater();
};

// when user clicks on showTrailer it will exit theater movie
app.hideTheater = function () {
	$('.showTrailer').on('click', function () {
		$(this).addClass('hideTrailer');
		$(this).empty();
	});
};

$(document).ready(function () {
	app.init();
});