"use strict"

var SynthVcf = {
	Cutoff: [],
	Resonance: [],
	EgInt: [],
	Output: [],
	In1: [],
	In2: [],
	In3: [],
	In4: [],
	Out1: [],
	Out2: [],
	Out3: [],
	Out4: []
}

function InitSynthVcf() {
	for (var Track = 0; Track < Constants.NumTracks; Track++) {
		SynthVcf.Cutoff[Track] = 1
		SynthVcf.Resonance[Track] = 0
		SynthVcf.EgInt[Track] = 0
		SynthVcf.Output[Track] = CreateBuffer(Audio.BufferSize)
		SynthVcf.In1[Track] = 0
		SynthVcf.In2[Track] = 0
		SynthVcf.In3[Track] = 0
		SynthVcf.In4[Track] = 0
		SynthVcf.Out1[Track] = 0
		SynthVcf.Out2[Track] = 0
		SynthVcf.Out3[Track] = 0
		SynthVcf.Out4[Track] = 0
	}
}

function ProcessSynthVcf(Track, NumSamples) {
	var SampleRate = Audio.SampleRate
	var EgOutput = SynthEg.Output[Track]
	var VcoOutput = SynthVco.Output[Track]
	var Cutoff = SynthVcf.Cutoff[Track]
	var Resonance = SynthVcf.Resonance[Track]
	var EgInt = SynthVcf.EgInt[Track]
	var Output = SynthVcf.Output[Track]
	var In1 = SynthVcf.In1[Track]
	var In2 = SynthVcf.In2[Track]
	var In3 = SynthVcf.In3[Track]
	var In4 = SynthVcf.In4[Track]
	var Out1 = SynthVcf.Out1[Track]
	var Out2 = SynthVcf.Out2[Track]
	var Out3 = SynthVcf.Out3[Track]
	var Out4 = SynthVcf.Out4[Track]

	for (var i = 0; i < NumSamples; i++) {
		var F = (Cutoff + EgInt * EgOutput[i]) * 1.16
		var Fb = 4 * Resonance * (1.0 - 1.15 * F * F)
		var Input = VcoOutput[i]
		Input -= Out4 * Fb
		Input *= 0.35013 * F * F * F * F
		Out1 = Input + 0.3 * In1 + (1 - F) * Out1
		In1 = Input
		Out2 = Out1 + 0.3 * In2 + (1 - F) * Out2
		In2 = Out1
		Out3 = Out2 + 0.3 * In3 + (1 - F) * Out3
		In3 = Out2
		Out4 = Out3 + 0.3 * In4 + (1 - F) * Out4
		In4 = Out3
		Output[i] = Out4
	}

	SynthVcf.In1[Track] = In1
	SynthVcf.In2[Track] = In2
	SynthVcf.In3[Track] = In3
	SynthVcf.In4[Track] = In4
	SynthVcf.Out1[Track] = Out1
	SynthVcf.Out2[Track] = Out2
	SynthVcf.Out3[Track] = Out3
	SynthVcf.Out4[Track] = Out4
}
