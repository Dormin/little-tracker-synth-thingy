"use strict"

var App = {
	ToolbarHeight: 12,
	NeedsToRedraw: true
}

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
	if (App.NeedsToRedraw) {
		DrawPanel(0, 0, Canvas.Width, App.ToolbarHeight)
		DrawString("BPM:120  >  PLAY:PATT EDIT:TRCK", 3, 3)
	}
}
