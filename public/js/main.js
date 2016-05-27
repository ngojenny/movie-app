
'use strict';

var app = {};
// var year = {};

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

	app.getData('2015');

	$('select').on('change', function () {
		// grab user choice, store in a variable
		var year = $('select').val();

		app.getData(year);
		$('#movieBox').empty();
	});
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
		// console.log("its done");
		// console.log(results1[0].results);
		var moviesPage1 = results1[0].results;
		// console.log(results2[0].results);
		var moviesPage2 = results2[0].results;
		app.combinePages(moviesPage1, moviesPage2);
	});
};

//this function that will concat the top 20 movies from page 1 and two into one array with 40 movie objects

app.combinePages = function (pg1, pg2) {
	var combinedPgsArray = pg1.concat(pg2);
	// console.log(combinedPgsArray);
	app.sortArray(combinedPgsArray);
};

//this function will sort the array of 40 movie objects from highest vote average to lowest
app.sortArray = function (combinedPgsArray) {
	function compare(a, b) {
		if (a.vote_average > b.vote_average) return -1;else if (a.vote_average < b.vote_average) return 1;else return 0;
	}
	// console.log(combinedPgsArray.sort(compare));
	var topMovies = combinedPgsArray.sort(compare);
	app.topTen(topMovies);
};

//this function will pull the top ten/first ten objects in array

app.topTen = function (topMovies) {
	console.log(topMovies.slice(0, 10));
	var topTenMovies = topMovies.slice(0, 10);

	app.displayTopTen(topTenMovies);
	app.getIdArray(topTenMovies);
};

//this function will pull out the poster_path from the 10 objects within the array.
//we will concat the value from the poster_path key with the rest of the image URL
// to make the src for the images
app.displayTopTen = function (movies) {
	movies.forEach(function (displayTopTen) {

		var posterLink = 'https://image.tmdb.org/t/p/original' + displayTopTen.poster_path;

		var img = $('<img>').addClass('moviePoster').attr('src', posterLink).data('movieObject', displayTopTen);

		$('#movieBox').append(img);

		// var movieTitle = displayTopTen.title;
	});

	app.displayMoreInfo();
};

app.displayMoreInfo = function (singleMovie) {

	$('#movieBox').on('click', 'img', function () {
		// console.log("does this work????????????????");
		var movieInfo = $(this).data('movieObject');
		$('.moreInfo').remove();
		$('<div>').addClass('moreInfo').insertAfter("img:nth-of-type(5)");
		$('.moreInfo').append($('<div>').addClass('infoPoster'));
		$('.moreInfo').append($('<div>').addClass('infoContent'));
		console.log(movieInfo.title);

		var movieTitle = $('<h3>').text(movieInfo.title);
		var moviePoster = 'https://image.tmdb.org/t/p/original' + movieInfo.poster_path;
		var img = $('<img>').addClass('infoMoviePoster').attr('src', moviePoster);
		var description = $('<p>').text("Description: " + movieInfo.overview);
		var userRating = $('<p>').text(movieInfo.vote_average + "/10");
		$('.infoPoster').append(img);
		$('.infoContent').append(movieTitle, description, userRating);
		// $('.infoContent').append();
	});
};

//This function will create an array of movie ids
app.getIdArray = function (movieArray) {
	console.log(movieArray);
	var idArray = [];
	movieArray.forEach(function (movieObject) {
		idArray.push(movieObject.id);
	});
	app.getTrailers(idArray);
	console.log(idArray);
};

app.getTrailers = function (idArray) {
	window.getTrailers = idArray.map(function (id) {
		return $.ajax({
			url: 'http://api.themoviedb.org/3/movie/' + id + '/videos',
			method: 'GET',
			dataType: 'jsonp',
			data: {
				api_key: 'f43968b7420dc8dd5dc5be75cb2d3725'
			}
		});
	});
	$.when.apply(null, getTrailers).then(function (success) {
		console.log('Success:');
		console.log(success);
	}, function (failure) {
		console.log('Failure:');
		console.log(failure);
	});
};

$(document).ready(function () {

	app.init();
});