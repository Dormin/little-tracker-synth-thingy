"use strict"

var SynthAmp = {
	GateTransitionDuration: 0.003,
	Gate: [],
	TargetGate: [],
	Volume: [],
	Pan: [],
	OutputL: [],
	OutputR: []
}

function InitSynthAmp() {
	for (var Track = 0; Track < Constants.NumTracks; Track++) {
		SynthAmp.Gate[Track] = 0
		SynthAmp.TargetGate[Track] = 0
		SynthAmp.Volume[Track] = 0
		SynthAmp.Pan[Track] = 0
		SynthAmp.OutputL[Track] = CreateBuffer(Audio.BufferSize)
		SynthAmp.OutputR[Track] = CreateBuffer(Audio.BufferSize)
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
	var Pan = SynthAmp.Pan[Track]
	var OutputL = SynthAmp.OutputL[Track]
	var OutputR = SynthAmp.OutputR[Track]
	var GateDelta = 1 / GateTransitionDuration / SampleRate
	var Theta = Math.PI / 2 * Pan
	var CosTheta = Math.cos(Theta)
	var SinTheta = Math.sin(Theta)
	var K = Math.sqrt(2) / 2
	var AmpL = Volume * K * (CosTheta - SinTheta)
	var AmpR = Volume * K * (CosTheta + SinTheta)

	for (var i = 0; i < NumSamples; i++) {
		var Input = VcfOutput[i]

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

		OutputL[i] = Gate * AmpL * Input
		OutputR[i] = Gate * AmpR * Input
	}

	SynthAmp.Gate[Track] = Gate
}