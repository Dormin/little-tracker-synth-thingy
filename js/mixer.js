"use strict"

var Mixer = {
	Tracks: []
}

function InitMixer() {
	for (var i = 0; i < Constants.NumTracks; i++) {
		Mixer.Tracks[i] = {
			BufferL: CreateBuffer(Audio.BufferSize),
			BufferR: CreateBuffer(Audio.BufferSize)
		}
	}
}

function ProcessMixer(OutputL, OutputR, NumSamples, Offset) {
	var NumTracks = Constants.NumTracks

	for (var j = 0; j < NumSamples; j++) {
		OutputL[j + Offset] = 0
		OutputR[j + Offset] = 0
	}

	for (var i = 0; i < NumTracks; i++) {
		var Track = Mixer.Tracks[i]
		var BufferL = Track.BufferL
		var BufferR = Track.BufferR

		ProcessSynth(i, BufferL, BufferR, NumSamples)

		for (var j = 0; j < NumSamples; j++) {
			OutputL[j + Offset] += BufferL[j] / NumTracks
			OutputR[j + Offset] += BufferR[j] / NumTracks
		}
	}
}
