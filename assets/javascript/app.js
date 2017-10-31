
var config = {
	apiKey: "AIzaSyDvTaEdf9GAdlC92DjEfYzdYzYl7k7gzSw",
	authDomain: "train-schedule-a7303.firebaseapp.com",
	databaseURL: "https://train-schedule-a7303.firebaseio.com",
	projectId: "train-schedule-a7303",
	storageBucket: "train-schedule-a7303.appspot.com",
	messagingSenderId: "127209881284"
};
firebase.initializeApp(config);

var database = firebase.database();

var animating;

// when user enters data, capture info and push to Firebase database
function addTrain() {
	event.preventDefault();

	var trainObj = {
		name: $("#train-name").val().trim(),
		destination: $("#train-destination").val().trim(),
		firstTime: $("#train-first-time").val().trim(),
		frequency: $("#train-frequency").val().trim()
	}

	$("#train-name").val("");
	$("#train-destination").val("");
	$("#train-first-time").val("");
	$("#train-frequency").val("");

	database.ref('trains').push(trainObj);
}

// when data is added in Firebase, pull data and populate table
database.ref('trains').on("child_added", function(snapshot) {
	var data = snapshot.val();

	console.log(data);

	var away = timeAway(data.frequency, data.firstTime); 
	var next = nextTime(away); 

	var tRow = $("<tr class='train-row'>")

	var tD1 = $("<td>").text(data.name);
	var tD2 = $("<td>").text(data.destination);
	var tD3 = $("<td>").text(data.frequency);
	var tD4 = $("<td>").text(next);
	var tD5 = $("<td class='time-away'>").text(away);

	$(tRow).append(tD1, tD2, tD3, tD4, tD5)
	$("#train-table-body").append(tRow);

	sortTrainTable();
});

function timeAway(freq, first) {
	var diff = moment().diff(moment(first, "hh:mm"), "minutes");

	if(diff < 0) {
		diff = moment().diff(moment(first, "hh:mm").subtract(1, "days"), "minutes")
	}

	return (freq - (diff % freq));
}

function nextTime(until) {
	return moment().add(until, "minutes").format("hh:mm A");
}

function sortTrainTable() {
	var rowsArr = $(".train-row");

	do {
		var sorted = true;

		for(var i = 0; i < rowsArr.length - 1; i += 1) {

			var t1 = parseInt($(rowsArr[i].lastChild).text());
			var t2 = parseInt($(rowsArr[i+1].lastChild).text());

			if( t1 > t2 ) {
				var temp = rowsArr[i+1];
				rowsArr[i+1] = rowsArr[i];
				rowsArr[i] = temp;

				sorted = false;
			}
		}
	} while(!sorted)

	updateTable(rowsArr);

	updateGraph(rowsArr);
}

function updateTable(arr) {
	$("#train-table-body").empty();

	for(row of arr) {
		$("#train-table-body").append(row);
	}
}

function updateGraph(arr) {
	$("#train-graph-body").empty();

	for(train of arr) {
		var name = $( $(train).children()[0] ).text();
		var away = parseInt($(train.lastChild).text());

		var awayPercent = ((away/60)*100);

		if(awayPercent <= 100){
			var row = $("<tr>");

			var nameCell = $("<td class='name-cell'>").text(name);

			var bar = $("<div class='bar'>").attr("data-width", `${awayPercent}%`);
			var time = $("<span class='bar-time'>").text(away);

			var graphCell = $("<td class='bar-cell'>").append( $(bar).append(time) );

			$("#train-graph-body").append( $(row).append(nameCell, graphCell) );
		}
	}

	animateGraph($(".bar"), 0);
}

function animateGraph(bars, i) {
	clearTimeout(animating);

	animating = setTimeout( function() {
		if(i < bars.length){
			$(bars[i]).animate({
				width: $(bars[i]).attr("data-width")
			}, 800)

			barTimer = setTimeout(function(){
				i+=1;
				animateGraph(bars, i);
			}, 150);
		}
	}, 200)
}


$("#submit-train").click(function(event) {
	event.preventDefault();
	addTrain();
});

