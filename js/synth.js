"use strict"

var Synth = {
	GateTransitionDuration: 0.003,
	NumSynths: 0,
	Tracks: []
}

function InitSynth() {
	InitSynthEg()
	InitSynthVco()
	InitSynthVcf()
	Synth.NumSynths = Constants.NumTracks
	for (var Track = 0; Track < Constants.NumTracks; Track++) {
		Synth.Tracks[Track] = {
			Instrument: 0,
			Gate: 0,
			TargetGate: 0
		}
	}
}

function SynthNoteOn(Track, Note) {
	Synth.Tracks[Track].TargetGate = 1
	SynthVco.Tracks[Track].Note = Note - 57
}

function SynthNoteOff(Track) {
	Synth.Tracks[Track].TargetGate = 0
}

function SynthNoteOffAll() {
	for (var Track = 0; Track < Constants.NumTracks; Track++) {
		SynthNoteOff(Track)
	}
}

function SetSynthInstrument(Index, Instrument) {
	Synth.Tracks[Track].Instrument = Instrument
}

function ProcessSynth(OutputL, OutputR, NumSamples, Offset) {
	var SampleRate = Audio.SampleRate
	var NumTracks = Constants.NumTracks
	var GateTransitionDuration = Synth.GateTransitionDuration

	ProcessSynthEg(NumSamples)
	ProcessSynthVco(NumSamples)
	ProcessSynthVcf(NumSamples)

	for (var i = 0; i < NumSamples; i++) {
		OutputL[i + Offset] = 0
		OutputR[i + Offset] = 0
	}

	for (var Track = 0; Track < NumTracks; Track++) {
		var SynthTrack = Synth.Tracks[Track]
		var Instrument = Instruments[SynthTrack.Instrument]
		var Volume = Instrument.Volume
		var Gate = SynthTrack.Gate
		var TargetGate = SynthTrack.TargetGate
		var GateDelta = 1 / GateTransitionDuration / SampleRate
		var VcoOutput = SynthVco.Tracks[Track].Output

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

		SynthTrack.Gate = Gate
	}
}
