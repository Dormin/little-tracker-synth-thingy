"use strict"

var Synth = {
	GateTransitionDuration: 0.003,
	Gate: [],
	TargetGate: [],
	Instrument: [],
}

function InitSynth() {
	InitSynthEg()
	InitSynthVco()
	InitSynthVcf()
	for (var Track = 0; Track < Constants.NumTracks; Track++) {
		Synth.Gate[Track] = 0
		Synth.TargetGate[Track] = 0
		Synth.Instrument[Track] = 0
	}
}

function SynthNoteOn(Track, Note, Retrigger) {
	Note -= 57
	Synth.TargetGate[Track] = 1
	SynthEgNoteOn(Track, Note, Retrigger)
	SynthVcoNoteOn(Track, Note, Retrigger)
}

function SynthNoteOff(Track) {
	Synth.TargetGate[Track] = 0
}

function SynthNoteOffAll() {
	for (var Track = 0; Track < Constants.NumTracks; Track++) {
		SynthNoteOff(Track)
	}
}

function SetSynthInstrument(Track, Instrument) {
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
		var Instrument = Song.Instruments[Synth.Instrument[Track]]

		SynthEg.Duration[Track] = Instrument.EgDecay / 100
		ProcessSynthEg(Track, NumSamples)

		SynthVco.PortaDuration[Track] = Instrument.VcoPortamento / 100
		SynthVco.Vco2Detune[Track] = Instrument.Vco2Detune / 10
		SynthVco.EgInt[Track] = Instrument.VcoEgInt / 100
		ProcessSynthVco(Track, NumSamples)

		SynthVcf.Cutoff[Track] = Instrument.VcfCutoff / 100
		SynthVcf.Resonance[Track] = Instrument.VcfResonance / 100
		SynthVcf.EgInt[Track] = Instrument.VcfEgInt / 100
		ProcessSynthVcf(Track, NumSamples)
	}

	for (var Track = 0; Track < NumTracks; Track++) {
		var Instrument = Song.Instruments[Synth.Instrument[Track]]
		var Volume = Instrument.Volume / 100
		var Gate = Synth.Gate[Track]
		var TargetGate = Synth.TargetGate[Track]
		var GateDelta = 1 / GateTransitionDuration / SampleRate
		var VcfOutput = SynthVcf.Output[Track]

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
			var Sample = Gate * Volume * VcfOutput[i] / NumTracks
			OutputL[i + Offset] += Sample
			OutputR[i + Offset] += Sample
		}

		Synth.Gate[Track] = Gate
	}
}
