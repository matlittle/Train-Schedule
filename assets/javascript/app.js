
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


// when user enters data, capture info and push to Firebase database
function addTrain() {
	event.preventDefault();

	var name = $("#train-name").val().trim();
	var dest = $("#train-destination").val().trim();
	var first = $("#train-first-time").val().trim();
	var freq = $("#train-frequency").val().trim();

	$("#train-name").val("");
	$("#train-destination").val("");
	$("#train-first-time").val("");
	$("#train-frequency").val("");

	database.ref('trains').push({
		name: name,
		destination: dest, 
		firstTime: first,
		frequency: freq
	});
}

// when data changes in Firebase, pull data and populate table
database.ref('trains').on("child_added", function(snapshot) {
	var data = snapshot.val();

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
	$("#train-graph").empty();

	console.log(arr);

	for(train of arr) {
		var name = $( $(train).children()[0] ).text();
		var away =  parseInt($(train.lastChild).text());

		console.log("Name: ", name, "  Away: ", away);

		var row = $("<tr>");

		var nameCell = $("<td class='graph-name'>").text(name);
		var awaySpan = $("<span class='away-graph'>").css("width", `${away/100}%`);
		var remSpan = $("<span class='rem-graph'>").css("width", `${100- (away/100)}%`);

		var graphCell = $("<td class='graph-line'>").append(awaySpan, remSpan);

		$("#train-graph").append( $(row).append(nameCell, graphCell) );
	}
}


$("#submit-train").click(function(event) {
	event.preventDefault();
	addTrain();
});

