"use strict"

var SynthVcf = {
	Tracks: []
}

function InitSynthVcf() {
	for (var i = 0; i < Constants.NumTracks; i++) {
		SynthVcf.Tracks[i] = {
			Output: CreateBuffer(Audio.BufferSize),
		}
	}
}

function ProcessSynthVcf(Track, NumSamples) {

}
