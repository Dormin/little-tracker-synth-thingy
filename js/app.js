"use strict"

var App = {
	ToolbarHeight: 12,
	SamplesLeftInStep: 0,
	NeedsToRedraw: true
}

function InitApp() {
	InitUi()
	InitSong()
	InitSongPlayer()
	InitSynth()
	InitInstrumentEditor()
	InitPatternEditor()
	InitSequenceEditor()
}

function ProcessApp(OutputL, OutputR, NumSamples) {
	var StepsPerSecond = 4 * Song.Bpm / 60
	var SamplesPerStep = Audio.SampleRate / StepsPerSecond
	var SamplesLeftInBuffer = NumSamples
	var Offset = 0

	while (SamplesLeftInBuffer > 0) {
		if (App.SamplesLeftInStep <= 0) {
			if (SongPlayer.IsPlaying) {
				HandleSongPlayerStep()
			}
			App.SamplesLeftInStep += SamplesPerStep
			PatternEditor.NeedsToRedraw = true
		}

		var NumSamplesToProcess = Math.min(SamplesLeftInBuffer,
			Math.ceil(App.SamplesLeftInStep))

		ProcessSynth(OutputL, OutputR, NumSamplesToProcess, Offset)
		Offset += NumSamplesToProcess
		App.SamplesLeftInStep -= NumSamplesToProcess
		SamplesLeftInBuffer -= NumSamplesToProcess
	}
}

function HandleAppInput(Event, Key) {
	if (Event === "Press" && Key === "Spacebar") {
		if (SongPlayer.IsPlaying) {
			StopSongPlayer()
		} else {
			StartSongPlayer()
		}
	} else {
		HandleSequenceEditorInput(Event, Key)
		HandlePatternEditorInput(Event, Key)
	}
}

function DrawApp() {
	if (App.NeedsToRedraw) {
		DrawPanel(0, 0, Canvas.Width, App.ToolbarHeight)
		DrawString("BPM 120 SWING 50  >", 3, 3)
		App.NeedsToRedraw = false
	}
	DrawInstrumentEditor()
	DrawSequenceEditor()
	DrawPatternEditor()
}
