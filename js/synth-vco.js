"use strict"

var SynthVco = {
	Note: [],
	Portamento: [],
	Vco2Pitch: [],
	EgInt: [],
	Output: [],
	Time: []
}

function InitSynthVco() {
	for (var Track = 0; Track < Constants.NumTracks; Track++) {
		SynthVco.Note[Track] = 0
		SynthVco.Portamento[Track] = 0
		SynthVco.Vco2Pitch[Track] = 0
		SynthVco.EgInt[Track] = 0
		SynthVco.Output[Track] = CreateBuffer(Audio.BufferSize),
		SynthVco.Time[Track] = 0
	}
}

function ProcessSynthVco(Track, NumSamples) {
	var SampleRate = Audio.SampleRate
	var Note = SynthVco.Note[Track]
	var Portamento = SynthVco.Portamento[Track]
	var Vco2Pitch = SynthVco.Vco2Pitch[Track]
	var EgInt = SynthVco.EgInt[Track]
	var Output = SynthVco.Output[Track]
	var Time = SynthVco.Time[Track]
	var Freq = 440 * Math.pow(2, Note / 12)

	for (var i = 0; i < NumSamples; i++) {
		Output[i] = SawWave(Time)
		Time += Freq / SampleRate
	}

	SynthVco.Time[Track] = Time
}

function SineWave(Time) {
	return Math.sin(2 * Math.PI * Time)
}

function SawWave(Time) {
	return 1 - 2 * (Time % 1)
}
