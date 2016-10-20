"use strict"

var SynthStates = []

function InitSynths(NumSynths) {
	for (var i = 0; i < NumSynths; i++) {
		SynthStates[i] = {
			Freq: 440,
			Time: 0
		}
	}
}

function ProcessSynth(Index, OutputL, OutputR, NumSamples, SampleRate) {
	var State = SynthStates[Index]
	var Freq = State.Freq
	var Time = State.Time

	for (var i = 0; i < NumSamples; i++) {
		var Sample = Math.sin(2 * Math.PI * Time)
		Time += Freq / SampleRate
		OutputL[i] = Sample
		OutputR[i] = Sample
	}

	State.Time = Time
}
