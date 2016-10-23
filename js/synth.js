"use strict"

var Synth = {
	GateTransitionTime: 0.003,
	NumSynths: 0,
	States: []
}

function InitSynths(NumSynths) {
	Synth.NumSynths = NumSynths
	for (var i = 0; i < NumSynths; i++) {
		Synth.States[i] = {
			Gate: 0,
			TargetGate: 0,
			Freq: 0,
			Time: 0
		}
	}
}

function SynthNoteOn(Index, Note) {
	var State = Synth.States[Index]
	State.TargetGate = 1
	State.Freq = 440 * Math.pow(2, (Note - 57) / 12)
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

function ProcessSynth(Index, OutputL, OutputR, NumSamples) {
	var SampleRate = Audio.SampleRate
	var GateTransitionTime = Synth.GateTransitionTime
	var State = Synth.States[Index]
	var Gate = State.Gate
	var TargetGate = State.TargetGate
	var Freq = State.Freq
	var Time = State.Time
	var GateDelta = 1 / GateTransitionTime / SampleRate

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
		var Sample = Gate * Math.sin(2 * Math.PI * Time)
		Time += Freq / SampleRate
		OutputL[i] = Sample
		OutputR[i] = Sample
	}

	State.Gate = Gate
	State.Time = Time
}
