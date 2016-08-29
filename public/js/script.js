
// fix scrollspy for using a fixed navbar
var scrolloffset = 51;

// images to preload
var imageSrcMap = [
//	{id: 'img-', url: 'img/.png'},
];

///////////////////////////////////////////////////////////////////////////////

function init()
{
	// configure scrollspy
	$('body').scrollspy({ target: '#navbar-site', offset: scrolloffset });

	// Add smooth scrolling to all links inside a navbar
	$("#navbar-site a").on('click', function(event){
		// Prevent default anchor click behavior
		event.preventDefault();

		// Store hash (#)
		var hash = this.hash;

		// Using jQuery's animate() method to add smooth page scroll
		// The optional number (800) specifies the number of milliseconds it takes to scroll to the specified area (the speed of the animation)
		$('html, body').animate({
			scrollTop: ($(hash).offset().top-scrolloffset+1)
		}, 800, function(){
			// Add hash (#) to URL when done scrolling (default click behavior)
			window.location.hash = hash;
		});
	});

	// preload other images
	preloadImages();

	getResults();

	//runGlitching();
}

///////////////////////////////////////////////////////////////////////////////

function preloadImages()
{
	var images = new Array()
	for (i = 0; i < imageSrcMap.length; i++)
	{
		images[i] = new Image();
		images[i].src = imageSrcMap[i].url;
	}
}

///////////////////////////////////////////////////////////////////////////////

function runGlitching()
{
	setTimeout(glitch1, 3000);
	setTimeout(glitch2, 4000);
}
function glitch1()
{
	$('body').addClass('glitch');
	$('body').removeClass('glitch');
	$('body').addClass('glitch');
}
function glitch2()
{
	$('body').removeClass('glitch');
}

///////////////////////////////////////////////////////////////////////////////

var fields = [];
var results = [];
var multiplier = {};

function getResults()
{
	//console.log('get results');
	$.getJSON('results.json', function(data) {
		//console.log('got results');
		if (data && data.results)
		{
			fields = data.fields;
			results = data.results;
			multiplier = data.multiplier;
			processResults();
		}
	});
}

function processResults()
{
	var performance = [];

	for (var i = 0; i < results.length; i++)
	{
		// make tabs
		var t = $("#templateresulttab").children().clone();
		if (i == 0)
			t.addClass('active');

		t.find('a').attr('href', "#team"+results[i].team)
					.attr('aria-controls', "team"+results[i].team)
					.html(results[i].gametime);
		t.appendTo("#tablist");

		/////////////////////////

		// set details
		var c = $("#templateresultcontent").children().clone();
		c.attr('id', "team"+results[i].team)
		if (0 == i)
			c.addClass('active');

		// set summary values
		c.find('.team').html(results[i].team);
		c.find('.name').html(results[i].name);
		c.find('.gametime').html(results[i].gametime);
		c.find('.timeremaining').html(results[i].timeremaining);

		var members = '';
		for (var j=0; j < results[i].members.length; j++)
		{
			members += results[i].members[j];
			if (j < results[i].members.length-1)
				members += ', ';
		}
		c.find('.members').html(members);

		// get the table into which to add detail rows
		var st = c.find('.resultdetails tbody');

		var grandtotal = 0;
		var possibletotal = 0;

		// set detail values
		for (var k=0; k < fields.length; k++)
		{
			var d = $("#templateresultcontentdetailsrow").find('tr').clone();
			
			d.attr('id', "detailrow"+fields[k].name);
			var dname = '';
			if (fields[k].bonus)
				dname = "Bonus&ast;: ";
			dname += fields[k].display;
			d.find('.resultname').html(dname);
			d.find('.resultvalue').html(results[i].score[fields[k].name]);
			d.find('.resultmultiplier').html(fields[k].multiplier);
			d.find('.resultmaximum').html(fields[k].max);
			var total = fields[k].multiplier * results[i].score[fields[k].name];
			if ((fields[k].max > 0 && total > fields[k].max) ||
				(fields[k].max < 0 && total < fields[k].max))
				total = fields[k].max;
			d.find('.resulttotal').html(total);

			grandtotal += total;

			if (!fields[k].bonus && fields[k].max > 0)
				possibletotal += fields[k].max;

			d.appendTo(st);
		}
		// calculate percentage
		var per = grandtotal * 100 / possibletotal;
		per = Math.round(per);

		c.find('.percentage').attr('title', per+'% Completed')
				.find('.progress-bar').attr('aria-valuenow', per)
				.css('width', per+'%');

		// add the footer total
		c.find('.resultfoottotal').html(grandtotal + "/" + possibletotal + ' = ' + per + '%');

		c.appendTo('#tabcontent');

		//////////////////////////

		// make performance
		var p = $("#templateperformancerow").find('tr').clone();
		p.find('.name').html(results[i].name);
		p.find('.gametime').html(results[i].gametime);

		p.find('.percentage').attr('title', per+'% Completed')
				.find('.progress-bar').attr('aria-valuenow', per)
				.css('width', per+'%');

		performance.push({'percentage': per, 'obj': p});
	}

	performance.sort(function(a, b) {
		if (a.percentage < b.percentage)
			return 1;
		if (a.percentage > b.percentage)
			return -1;
		return 0;
	});

	var lastrank = 0;
	var lastper = 0;
	for (var m=0; m < performance.length; m++)
	{
		var r = lastrank+1;
		if (performance[m].percentage == lastper)
			r = lastrank;

		(performance[m].obj).find('.rank').html(r);
		(performance[m].obj).appendTo("#performancelist");
		lastper = performance[m].percentage;
		lastrank = r;
		console.log(lastper, lastrank);
	}


}

///////////////////////////////////////////////////////////////////////////////

// run on startup
$(function() {
	init();
});