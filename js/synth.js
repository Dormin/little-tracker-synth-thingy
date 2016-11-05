"use strict"

var Synth = {
	GateTransitionDuration: 0.003,
	Instrument: [],
	Gate: [],
	TargetGate: []
}

function InitSynth() {
	InitSynthEg()
	InitSynthVco()
	InitSynthVcf()
	for (var Track = 0; Track < Constants.NumTracks; Track++) {
		Synth.Instrument[Track] = 0
		Synth.Gate[Track] = 0
		Synth.TargetGate[Track] = 0
	}
}

function SynthNoteOn(Track, Note) {
	Synth.TargetGate[Track] = 1
	SynthVco.Note[Track] = Note - 57
}

function SynthNoteOff(Track) {
	Synth.TargetGate[Track] = 0
}

function SynthNoteOffAll() {
	for (var Track = 0; Track < Constants.NumTracks; Track++) {
		SynthNoteOff(Track)
	}
}

function SetSynthInstrument(Index, Instrument) {
	Synth.Instrument[Track] = Instrument
}

function ProcessSynth(OutputL, OutputR, NumSamples, Offset) {
	var SampleRate = Audio.SampleRate
	var NumTracks = Constants.NumTracks
	var GateTransitionDuration = Synth.GateTransitionDuration

	for (var i = 0; i < NumSamples; i++) {
		OutputL[i + Offset] = 0
		OutputR[i + Offset] = 0
	}

	for (var Track = 0; Track < NumTracks; Track++) {
		var Instrument = Instruments[Synth.Instrument[Track]]

		ProcessSynthEg(Track, NumSamples)

		SynthVco.Portamento[Track] = Instrument.VcoPortamento / 100
		SynthVco.Vco2Pitch[Track] = Instrument.Vco2Pitch / 10
		SynthVco.EgInt[Track] = Instrument.VcoEgInt / 100
		ProcessSynthVco(Track, NumSamples)

		ProcessSynthVcf(Track, NumSamples)
	}

	for (var Track = 0; Track < NumTracks; Track++) {
		var Instrument = Instruments[Synth.Instrument[Track]]
		var Volume = Instrument.Volume / 100
		var Gate = Synth.Gate[Track]
		var TargetGate = Synth.TargetGate[Track]
		var GateDelta = 1 / GateTransitionDuration / SampleRate
		var VcoOutput = SynthVco.Output[Track]

		for (var i = 0; i < NumSamples; i++) {
			if (Gate > TargetGate) {
				Gate -= GateDelta
				if (Gate < 0) {
					Gate = 0
				}
			} else if (Gate < TargetGate) {
				Gate += GateDelta
				if (Gate > 1) {
					Gate = 1
				}
			}
			var Sample = Gate * Volume * VcoOutput[i] / NumTracks
			OutputL[i + Offset] += Sample
			OutputR[i + Offset] += Sample
		}

		Synth.Gate[Track] = Gate
	}
}
