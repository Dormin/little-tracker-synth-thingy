"use strict"

var SynthEg = {
	Tracks: []
}

function InitSynthEg() {
	for (var i = 0; i < Constants.NumTracks; i++) {
		SynthEg.Tracks[i] = {
			Output: CreateBuffer(Audio.BufferSize),
			Time: 0
		}
	}
}

function ProcessSynthEg(NumSamples) {

}
