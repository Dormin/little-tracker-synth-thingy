"use strict"

var SynthEg = {
	Duration: [],
	Output: [],
	Time: []
}

function InitSynthEg() {
	for (var Track = 0; Track < Constants.NumTracks; Track++) {
		SynthEg.Duration[Track] = 0
		SynthEg.Output[Track] = CreateBuffer(Audio.BufferSize)
		SynthEg.Time[Track] = 0
	}
}

function SynthEgNoteOn(Track, Note, Retrigger) {
	if (Retrigger) {
		SynthEg.Time[Track] = 0
	}
}

function ProcessSynthEg(Track, NumSamples) {
	var SampleRate = Audio.SampleRate
	var Duration = SynthEg.Duration[Track]
	var Output = SynthEg.Output[Track]
	var Time = SynthEg.Time[Track]

	if (Duration <= 0.001) {
		Duration = 0.001
	}

	for (var i = 0; i < NumSamples; i++) {
		var x = Math.min(0, Time / Duration - 1)
		Output[i] = 1 - Math.sqrt(1 - x * x)
		Time += 1 / SampleRate
	}

	SynthEg.Time[Track] = Time
}
