"use strict"

var Synths = []

function InitSynths(NumSynths) {
	for (var i = 0; i < NumSynths; i++) {
		Synths[i] = {
			Freq: 440,
			Time: 0
		}
	}
}

function ProcessSynth(Index, OutputL, OutputR, NumSamples, SampleRate) {
	var Synth = Synths[Index]
	var Freq = Synth.Freq
	var Time = Synth.Time

	for (var i = 0; i < NumSamples; i++) {
		var Sample = Math.sin(2 * Math.PI * Time)
		Time += Freq / SampleRate
		OutputL[i] = Sample
		OutputR[i] = Sample
	}

	Synth.Time = Time
}
