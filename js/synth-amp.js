"use strict"

var SynthAmp = {
	GateTransitionDuration: 0.003,
	Gate: [],
	TargetGate: [],
	Volume: [],
	Output: []
}

function InitSynthAmp() {
	for (var Track = 0; Track < Constants.NumTracks; Track++) {
		SynthAmp.Gate[Track] = 0
		SynthAmp.TargetGate[Track] = 0
		SynthAmp.Volume[Track] = 0
		SynthAmp.Output[Track] = CreateBuffer(Audio.BufferSize)
	}
}

function SynthAmpNoteOn(Track, Note, Retrigger) {
	SynthAmp.TargetGate[Track] = 1
}

function SynthAmpNoteOff(Track) {
	SynthAmp.TargetGate[Track] = 0
}

function ProcessSynthAmp(Track, NumSamples) {
	var SampleRate = Audio.SampleRate
	var VcfOutput = SynthVcf.Output[Track]
	var GateTransitionDuration = SynthAmp.GateTransitionDuration
	var Gate = SynthAmp.Gate[Track]
	var TargetGate = SynthAmp.TargetGate[Track]
	var Volume = SynthAmp.Volume[Track]
	var Output = SynthAmp.Output[Track]
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

		Output[i] = Gate * Volume * VcfOutput[i]
	}

	SynthAmp.Gate[Track] = Gate
}