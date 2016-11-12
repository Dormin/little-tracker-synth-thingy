"use strict"

var SynthDelay = {
	Intensity: [],
	Output: [],
	Buffer1: [],
	Buffer2: [],
	ReadPos: []
}

function InitSynthDelay() {
	for (var Track = 0; Track < Constants.NumTracks; Track++) {
		SynthDelay.Intensity[Track] = 0
		SynthDelay.Output[Track] = CreateBuffer(Audio.BufferSize)
		SynthDelay.Buffer1[Track] = CreateBuffer(4 * Audio.SampleRate)
		SynthDelay.Buffer2[Track] = CreateBuffer(4 * Audio.SampleRate)
		SynthDelay.ReadPos[Track] = 0
	}
}

function ProcessSynthDelay(Track, NumSamples) {
	var SampleRate = Audio.SampleRate
	var Bpm = Song.Bpm
	var AmpOutput = SynthAmp.Output[Track]
	var Intensity = SynthDelay.Intensity[Track]
	var Output = SynthDelay.Output[Track]
	var Buffer1 = SynthDelay.Buffer1[Track]
	var Buffer2 = SynthDelay.Buffer2[Track]
	var ReadPos = SynthDelay.ReadPos[Track]
	var BufferSize = Buffer1.length
	var StepTime = 60 / Bpm / 4
	var SamplesPerStep = StepTime * SampleRate
	var StepsPerDelay = 3
	var SamplesPerDelay = (SamplesPerStep * StepsPerDelay) | 0
	var WritePos1 = (ReadPos + 1 * SamplesPerDelay) % BufferSize
	var WritePos2 = (ReadPos + 2 * SamplesPerDelay) % BufferSize
	var Intensity1 = Intensity / 2
	var Intensity2 = Intensity / 8

	for (var i = 0; i < NumSamples; i++) {
		var Input = AmpOutput[i]
		Buffer1[WritePos1] = Input * Intensity1
		WritePos1 = (WritePos1 + 1) % BufferSize
		Buffer2[WritePos2] = Input * Intensity2
		WritePos2 = (WritePos2 + 1) % BufferSize
	}

	for (var i = 0; i < NumSamples; i++) {
		var Input = AmpOutput[i]
		Output[i] = (Input + Buffer1[ReadPos] + Buffer2[ReadPos]) * 0.75
		ReadPos = (ReadPos + 1) % BufferSize
	}

	SynthDelay.ReadPos[Track] = ReadPos
}
