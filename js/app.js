"use strict"

var App = {}

function InitApp() {

}

function ProcessApp(OutputL, OutputR, NumSamples) {
	ProcessTracker(OutputL, OutputR, NumSamples)
}

function HandleAppInput(Event, Key) {
	HandleTrackerInput(Event, Key)
}

function DrawApp() {
	DrawTracker()
}
