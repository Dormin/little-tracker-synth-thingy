"use strict"

var SynthVcf = {
	Cutoff: [],
	Resonance: [],
	EgInt: [],
	Output: [],
	X1: [],
	X2: [],
	Y1: [],
	Y2: []
}

function InitSynthVcf() {
	for (var Track = 0; Track < Constants.NumTracks; Track++) {
		SynthVcf.Cutoff[Track] = 1
		SynthVcf.Resonance[Track] = 0
		SynthVcf.EgInt[Track] = 0
		SynthVcf.Output[Track] = CreateBuffer(Audio.BufferSize)
		SynthVcf.X1[Track] = 0
		SynthVcf.X2[Track] = 0
		SynthVcf.Y1[Track] = 0
		SynthVcf.Y2[Track] = 0
	}
}

function ProcessSynthVcf(Track, NumSamples) {
	var SampleRate = Audio.SampleRate
	var Cutoff = SynthVcf.Cutoff[Track]
	var Resonance = Math.pow(10, -2 * SynthVcf.Resonance[Track])
	var EgInt = SynthVcf.EgInt[Track]
	var Output = SynthVcf.Output[Track]
	var X1 = SynthVcf.X1[Track]
	var X2 = SynthVcf.X2[Track]
	var Y1 = SynthVcf.Y1[Track]
	var Y2 = SynthVcf.Y2[Track]
	var EgOutput = SynthEg.Output[Track]
	var VcoOutput = SynthVco.Output[Track]

	for (var i = 0; i < NumSamples; i++) {
		var Cut = Cutoff + EgInt * EgOutput[i]
		Cut = 20000 * (Math.pow(2, Cut) - 1) / SampleRate
		var K = 0.5 * Resonance * Math.sin(Math.PI * Cut)
		var C1 = 0.5 * (1 - K) / (1 + K)
		var C2 = (0.5 + C1) * Math.cos(Math.PI * Cut)
		var C3 = (0.5 + C1 - C2) / 4
		var A0 = 2 * C3
		var A1 = 2 * 2 * C3
		var A2 = 2 * C3
		var B1 = 2 * -C2
		var B2 = 2 * C1
		var In = VcoOutput[i]
		var Out = A0 * In + A1 * X1 + A2 * X2 - B1 * Y1 - B2 * Y2
		X2 = X1
		X1 = In
		Y2 = Y1
		Y1 = Out
		Output[i] = Out
	}

	SynthVcf.X1[Track] = X1
	SynthVcf.X2[Track] = X2
	SynthVcf.Y1[Track] = Y1
	SynthVcf.Y2[Track] = Y2
}
