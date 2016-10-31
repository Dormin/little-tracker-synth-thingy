"use strict"

var App = {
	ToolbarHeight: 12,
	Bpm: 120,
	SamplesLeftInStep: 0,
	NeedsToRedraw: true
}

function InitApp() {
	InitUi()
	InitMixer()
	InitInstruments()
	InitInstrumentEditor()
	InitPatterns()
	InitPatternEditor()
	InitPatternPlayer()
	InitSong()
	InitSongEditor()
	InitSynths()
}

function ProcessApp(OutputL, OutputR, NumSamples) {
	var StepsPerSecond = 4 * App.Bpm / 60
	var SamplesPerStep = Audio.SampleRate / StepsPerSecond
	var SamplesLeftInBuffer = NumSamples
	var Offset = 0

	while (SamplesLeftInBuffer > 0) {
		if (App.SamplesLeftInStep <= 0) {
			if (PatternPlayer.IsPlaying) {
				HandlePatternPlayerStep()
			}
			App.SamplesLeftInStep += SamplesPerStep
			PatternEditor.NeedsToRedraw = true
		}

		var NumSamplesToProcess = Math.min(SamplesLeftInBuffer,
			Math.ceil(App.SamplesLeftInStep))

		ProcessMixer(OutputL, OutputR, NumSamplesToProcess, Offset)
		Offset += NumSamplesToProcess
		App.SamplesLeftInStep -= NumSamplesToProcess
		SamplesLeftInBuffer -= NumSamplesToProcess
	}
}

function HandleAppInput(Event, Key, X, Y) {
	if (Event === "Press" && Key === "Spacebar") {
		if (PatternPlayer.IsPlaying) {
			StopPatternPlayer()
		} else {
			StartPatternPlayer()
		}
	} else {
		HandlePatternEditorInput(Event, Key, X, Y)
	}
}

function DrawApp() {
	if (App.NeedsToRedraw) {
		DrawPanel(0, 0, Canvas.Width, App.ToolbarHeight)
		DrawString("BPM 120 SWING 50  >", 3, 3)
		App.NeedsToRedraw = false
	}
	DrawInstrumentEditor()
	DrawSongEditor()
	DrawPatternEditor()
}
