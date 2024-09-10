const firebaseConfig = {
	apiKey: "AIzaSyAhpbWrHq6x1ngXfyaBWb3335P_aV_RQjw",
	authDomain: "hrusta-c816f.firebaseapp.com",
	databaseURL:
		"https://hrusta-c816f-default-rtdb.europe-west1.firebasedatabase.app",
	projectId: "hrusta-c816f",
	storageBucket: "hrusta-c816f.appspot.com",
	messagingSenderId: "739741755800",
	appId: "1:739741755800:web:a279e178d36a412359a3ed",
};

let dataset = [500, 450, 600, 550, 500, 650, 500];

const timestamps = ["", "", "", "", "", "", ""];

const saveButton = document.getElementById("saveButton");
const inputValue = document.getElementById("maxCO");
const alarmButton = document.getElementById("turnOffAlarm");

function updateChart(data, timestamp) {
	dataset.push(data);
	timestamps.push(timestamp);

	if (dataset.length > 10) {
		dataset.shift();
		timestamps.shift();
	}

	myChart.data.datasets[0].data = dataset;
	myChart.data.labels = timestamps;
	myChart.update();
}

const app = firebase.initializeApp(firebaseConfig);
const database = firebase.database();

let gasConcentrationMgPerM3;
let maxCO;
let turnOffAlarm;
const _gasConcentrationMgPerM3 = database.ref("gasConcentrationMgPerM3");
const _maxCO = database.ref("maxCO");
const _turnOffAlarm = database.ref("turnOffAlarm");
_turnOffAlarm.on("value", (snapshot) => {
	turnOffAlarm = snapshot.val();
});

_maxCO.on("value", (snapshot) => {
	maxCO = snapshot.val();
	//Chart update
	inputValue.value = maxCO;
});

_gasConcentrationMgPerM3.on("value", (snapshot) => {
	gasConcentrationMgPerM3 = snapshot.val();

	document.getElementById("gasConcentrationMgPerM3").innerText =
		gasConcentrationMgPerM3.toFixed(2) + " mg/m³";
	//Chart update
	updateChart(gasConcentrationMgPerM3, new Date().toLocaleTimeString());
	maxCO = parseFloat(maxCO);
	gasConcentrationMgPerM3 = parseFloat(gasConcentrationMgPerM3);

	if (gasConcentrationMgPerM3 > maxCO && !turnOffAlarm) {
		// Show the popup
		document.getElementById("popup2").style.display = "block";
		document.getElementById("warning").style.display = "none";

		//database.ref("turnOffAlarm").set(false);
	} else if (gasConcentrationMgPerM3 > maxCO && turnOffAlarm) {
		document.getElementById("warning").style.display = "block";
	} else {
		// Hide the popup
		if (turnOffAlarm) database.ref("turnOffAlarm").set(false);

		document.getElementById("popup2").style.display = "none";
		document.getElementById("warning").style.display = "none";
	}
});

// Popup functionality
const popup = document.getElementById("popup");
const openBtn = document.getElementById("openPopupBtn");
const closeBtn = document.getElementById("closePopupBtn");

openBtn.onclick = () => {
	popup.style.display = "block";
};
closeBtn.onclick = () => {
	popup.style.display = "none";
};

window.onclick = (event) => {
	if (event.target == popup) {
		popup.style.display = "none";
	}
};

saveButton.addEventListener("click", () => {
	database.ref("maxCO").set(parseFloat(inputValue.value));
	popup.style.display = "none";
});

alarmButton.addEventListener("click", () => {
	database.ref("turnOffAlarm").set(true);
	document.getElementById("popup2").style.display = "none";
	document.getElementById("warning").style.display = "block";
});

////SOS--------------//
// let turnOffAlarm;
// const _turnOffAlarm = database.ref("turnOffAlarm");
// _turnOffAlarm.on("value", (snapshot) => {
// 	turnOffAlarm = snapshot.val();
// });
// document.getElementById("zadatak").addEventListener("click", () => {
// 	database.ref("turnOffAlarm").set(!turnOffAlarm);
// });

// Set up the chart
const myChart = new Chart("myChart", {
	type: "line",
	data: {
		labels: timestamps,
		datasets: [
			{
				data: dataset,
				borderColor: "white",
				fill: false,
			},
		],
	},
	options: {
		legend: { display: false },
		scales: {
			xAxes: [
				{
					gridLines: {
						color: "rgba(171,171,171,0)",
						lineWidth: 1,
					},
					ticks: {
						fontColor: "rgba(255,255,255,0.8)", // Change tick label color for Y axis
					},
				},
			],
			yAxes: [
				{
					gridLines: {
						color: "rgba(171,171,171,0.3)",
						lineWidth: 0.5,
					},
					ticks: {
						fontColor: "rgba(255,255,255,0.8)", // Change tick label color for Y axis
					},
				},
			],
		},
	},
});
