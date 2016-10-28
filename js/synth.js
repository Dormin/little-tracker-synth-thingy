"use strict"

var Synth = {
	GateTransitionDuration: 0.003,
	NumSynths: 0,
	States: []
}

function InitSynths(NumSynths) {
	Synth.NumSynths = NumSynths
	for (var i = 0; i < NumSynths; i++) {
		Synth.States[i] = {
			Instrument: 0,
			Gate: 0,
			TargetGate: 0,
			Note: 0,
			Vco1Time: 0,
			Vco2Time: 0
		}
	}
}

function SynthNoteOn(Index, Note) {
	var State = Synth.States[Index]
	State.TargetGate = 1
	State.Note = Note - 57
}

function SynthNoteOff(Index) {
	var State = Synth.States[Index]
	State.TargetGate = 0
}

function SynthNoteOffAll() {
	for (var i = 0; i < Synth.NumSynths; i++) {
		SynthNoteOff(i)
	}
}

function SetSynthInstrument(Index, Instrument) {
	var State = Synth.States[Index]
	State.Instrument = Instrument
}

function ProcessSynth(Index, OutputL, OutputR, NumSamples) {
	var SampleRate = Audio.SampleRate
	var GateTransitionDuration = Synth.GateTransitionDuration
	var State = Synth.States[Index]
	var Instrument = Instruments[State.Instrument]
	var Volume = Instrument.Volume
	var Vco2Pitch = Instrument.Vco2Pitch
	var Gate = State.Gate
	var TargetGate = State.TargetGate
	var Note = State.Note
	var Vco1Freq = 440 * Math.pow(2, Note / 12)
	var Vco2Freq = 440 * Math.pow(2, Note / 12 + Vco2Pitch)
	var Vco1Time = State.Vco1Time
	var Vco2Time = State.Vco2Time
	var GateDelta = 1 / GateTransitionDuration / SampleRate

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
		var Vco1Out = Math.sin(2 * Math.PI * Vco1Time)
		var Vco2Out = Math.sin(2 * Math.PI * Vco2Time)
		var VcoOut = (Vco1Out + Vco2Out) / 2
		var Sample = Gate * Volume * VcoOut
		Vco1Time += Vco1Freq / SampleRate
		Vco2Time += Vco2Freq / SampleRate
		OutputL[i] = Sample
		OutputR[i] = Sample
	}

	State.Gate = Gate
	State.Vco1Time = Vco1Time
	State.Vco2Time = Vco2Time
}
