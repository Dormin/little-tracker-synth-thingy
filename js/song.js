"use strict"

var Song = {
	Bpm: 120,
	SequenceLength: 1,
	Sequence: [],
	Patterns: [],
	Instruments: [],
	SequenceStep: 0,
	PatternStep: 0
}

function InitSong() {
	for (var i = 0; i < Constants.MaxSequenceLength; i++) {
		Song.Sequence[i] = 0
	}

	for (var i = 0; i < Constants.NumPatterns; i++) {
		var Tracks = []
		for (var j = 0; j < Constants.NumTracks; j++) {
			var Track = []
			for (var k = 0; k < Constants.MaxPatternLength; k++) {
				Track[k] = { Note: Constants.NoteKeep, Retrigger: false }
			}
			Tracks[j] = Track
		}
		Song.Patterns[i] = {
			Length: Constants.MaxPatternLength,
			Tracks: Tracks
		}
	}

	for (var i = 0; i < Constants.NumInstruments; i++) {
		Song.Instruments[i] = {
			Name: "DEFAULT",
			Volume: 100,
			Pan: 0,
			EgDecay: 100,
			VcoPortamento: 0,
			Vco2Detune: 0,
			VcoEgInt: 0,
			VcfCutoff: 100,
			VcfResonance: 0,
			VcfEgInt: 0,
			DelayTime: 0,
			DelayInt: 0
		}
	}
}

function SetSongSequencePattern(Step, Pattern) {
	Song.Sequence[Step] = Pattern
}

function GetSongSequencePattern() {
	return Song.Sequence[Song.SequenceStep]
}

function GetSongPatternCell(Track, Step) {
	var Pattern = GetSongSequencePattern()
	return Song.Patterns[Pattern].Tracks[Track][Step]
}
