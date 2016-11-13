"use strict"

var SynthDelay = {
	Intensity: [],
	OutputL: [],
	OutputR: [],
	Buffer1L: [],
	Buffer1R: [],
	Buffer2L: [],
	Buffer2R: [],
	ReadPos: []
}

function InitSynthDelay() {
	var BufferSize = 4 * Audio.SampleRate
	for (var Track = 0; Track < Constants.NumTracks; Track++) {
		SynthDelay.Intensity[Track] = 0
		SynthDelay.OutputL[Track] = CreateBuffer(Audio.BufferSize)
		SynthDelay.OutputR[Track] = CreateBuffer(Audio.BufferSize)
		SynthDelay.Buffer1L[Track] = CreateBuffer(BufferSize)
		SynthDelay.Buffer1R[Track] = CreateBuffer(BufferSize)
		SynthDelay.Buffer2L[Track] = CreateBuffer(BufferSize)
		SynthDelay.Buffer2R[Track] = CreateBuffer(BufferSize)
		SynthDelay.ReadPos[Track] = 0
	}
}

function ProcessSynthDelay(Track, NumSamples) {
	var SampleRate = Audio.SampleRate
	var Bpm = Song.Bpm
	var AmpOutputL = SynthAmp.OutputL[Track]
	var AmpOutputR = SynthAmp.OutputR[Track]
	var Intensity = SynthDelay.Intensity[Track]
	var OutputL = SynthDelay.OutputL[Track]
	var OutputR = SynthDelay.OutputR[Track]
	var Buffer1L = SynthDelay.Buffer1L[Track]
	var Buffer1R = SynthDelay.Buffer1R[Track]
	var Buffer2L = SynthDelay.Buffer2L[Track]
	var Buffer2R = SynthDelay.Buffer2R[Track]
	var ReadPos = SynthDelay.ReadPos[Track]
	var BufferSize = Buffer1L.length
	var StepTime = 60 / Bpm / 4
	var SamplesPerStep = StepTime * SampleRate
	var StepsPerDelay = 3
	var SamplesPerDelay = (SamplesPerStep * StepsPerDelay) | 0
	var WritePos1 = (ReadPos + 1 * SamplesPerDelay) % BufferSize
	var WritePos2 = (ReadPos + 2 * SamplesPerDelay) % BufferSize
	var Intensity1 = Intensity / 2
	var Intensity2 = Intensity / 8

	for (var i = 0; i < NumSamples; i++) {
		var InputL = AmpOutputL[i]
		var InputR = AmpOutputR[i]
		Buffer1L[WritePos1] = InputL * Intensity1
		Buffer1R[WritePos1] = InputR * Intensity1
		WritePos1 = (WritePos1 + 1) % BufferSize
		Buffer2L[WritePos2] = InputL * Intensity2
		Buffer2R[WritePos2] = InputR * Intensity2
		WritePos2 = (WritePos2 + 1) % BufferSize
	}

	for (var i = 0; i < NumSamples; i++) {
		var InputL = AmpOutputL[i]
		var InputR = AmpOutputR[i]
		OutputL[i] = (InputL + Buffer1L[ReadPos] + Buffer2L[ReadPos]) * 0.75
		OutputR[i] = (InputR + Buffer1R[ReadPos] + Buffer2R[ReadPos]) * 0.75
		ReadPos = (ReadPos + 1) % BufferSize
	}

	SynthDelay.ReadPos[Track] = ReadPos
}
