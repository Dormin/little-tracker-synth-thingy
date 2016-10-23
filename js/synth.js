"use strict"

var Synths = []

function InitSynths(NumSynths) {
	for (var i = 0; i < NumSynths; i++) {
		Synths[i] = {
			Gate: 0,
			Freq: 0,
			Time: 0
		}
	}
}

function SynthNoteOn(Index, Note) {
	var Synth = Synths[Index]
	Synth.Gate = 1
	Synth.Freq = 440 * Math.pow(2, (Note - 57) / 12)
}

function SynthNoteOff(Index) {
	var Synth = Synths[Index]
	Synth.Gate = 0
}

function SynthNoteOffAll() {
	for (var i = 0; i < Synths.length; i++) {
		SynthNoteOff(i)
	}
}

function ProcessSynth(Index, OutputL, OutputR, NumSamples) {
	var SampleRate = Audio.SampleRate
	var Synth = Synths[Index]
	var Gate = Synth.Gate
	var Freq = Synth.Freq
	var Time = Synth.Time

	for (var i = 0; i < NumSamples; i++) {
		var Sample = Gate * Math.sin(2 * Math.PI * Time)
		Time += Freq / SampleRate
		OutputL[i] = Sample
		OutputR[i] = Sample
	}

	Synth.Time = Time
}

function ProcessSynths(Indices, OutputL, OutputR, NumSamples) {
	var SampleRate = Audio.SampleRate
	for (var i = 0; i < NumSamples; i++) {
		var avgWeight = 1;
		OutputL[i] = OutputL[i] = 0;
		for (var Index in Indices){
			var Synth = Synths[Index]
			var Gate = Synth.Gate
			var Freq = Synth.Freq
			var Time = Synth.Time
			
			var Sample = Gate * Math.sin(2 * Math.PI * Time) / avgWeight
			avgWeight += Gate
			Time += Freq / SampleRate
			OutputL[i] += Sample
			OutputR[i] += Sample

			Synth.Time = Time
		}
	}
}
