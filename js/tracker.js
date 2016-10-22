"use strict"

var Tracker = {
	NumTracks: 4,
	NumPatterns: 16,
	ActivePattern: 0,
	CursorCol: 0,
	CursorRow: 0,
	Tracks: [],
	Patterns: [],
}

function InitTracker() {
	for (var i = 0; i < Tracker.NumPatterns; i++) {
		var NumRows = 64
		var Rows = []

		for (var j = 0; j < NumRows; j++) {
			var Row = []

			for (var k = 0; k < Tracker.NumTracks; k++) {
				Row[k] = { Note: null }
			}

			Rows[j] = Row
		}

		Tracker.Patterns[i] = {
			NumRows: NumRows,
			Rows: Rows
		}
	}

	for (var i = 0; i < Tracker.NumTracks; i++) {
		Tracker.Tracks[i] = {
			BufferL: CreateBuffer(Audio.BufferSize),
			BufferR: CreateBuffer(Audio.BufferSize)
		}
	}
}

function ProcessTracker(OutputL, OutputR, NumSamples) {
	var NumTracks = Tracker.NumTracks

	for (var i = 0; i < NumSamples; i++) {
		OutputL[i] = 0
		OutputR[i] = 0
	}

	for (var i = 0; i < NumTracks; i++) {
		var Track = Tracker.Tracks[i]
		var BufferL = Track.BufferL
		var BufferR = Track.BufferR

		ProcessSynth(i, BufferL, BufferR, NumSamples)

		for (var j = 0; j < NumSamples; j++) {
			OutputL[j] += BufferL[j] / NumTracks
			OutputR[j] += BufferR[j] / NumTracks
		}
	}
}
