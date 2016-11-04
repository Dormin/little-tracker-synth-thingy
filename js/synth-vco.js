"use strict"

var SynthVco = {
	Tracks: []
}

function InitSynthVco() {
	for (var i = 0; i < Constants.NumTracks; i++) {
		SynthVco.Tracks[i] = {
			Note: 0,
			Output: CreateBuffer(Audio.BufferSize),
			Time: 0
		}
	}
}

function ProcessSynthVco(NumSamples) {
	var SampleRate = Audio.SampleRate

	for (var Track = 0; Track < Constants.NumTracks; Track++) {
		var VcoTrack = SynthVco.Tracks[Track]
		var Note = VcoTrack.Note
		var Output = VcoTrack.Output
		var Time = VcoTrack.Time
		var Freq = 440 * Math.pow(2, Note / 12)

		for (var i = 0; i < NumSamples; i++) {
			Output[i] = Math.sin(2 * Math.PI * Time)
			Time += Freq / SampleRate
		}

		VcoTrack.Time = Time
	}
}
