
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

	var tRow = $("<tr>")

	var tD1 = $("<td>").text(data.name);
	var tD2 = $("<td>").text(data.destination);
	var tD3 = $("<td>").text(data.frequency);
	var tD4 = $("<td>").text(next);
	var tD5 = $("<td>").text(away);

	$(tRow).append(tD1, tD2, tD3, tD4, tD5)
	$("#train-table-body").append(tRow);

});

function timeAway(freq, first) {
	console.log(freq, first);
	var diff = moment().diff(moment(first, "hh:mm"), "minutes");

	console.log(diff);

	if(diff < 0) {
		var diff = moment().diff(moment(first, "hh:mm").subtract(1, "days"), "minutes")
	}

	console.log(diff);

	console.log(freq - (diff % freq));

	return (freq - (diff % freq));
}

function nextTime(until) {
	return moment().add(until, "minutes").format("HH:mm");
}



$("#submit-train").click(function(event) {
	event.preventDefault();
	addTrain();
});

