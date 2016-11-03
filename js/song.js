"use strict"

var Song = {
	Bpm: 120,
	SequenceLength: 1,
	Sequence: [],
	Patterns: [],
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
				Track[k] = { Note: Constants.NoteKeep }
			}
			Tracks[j] = Track
		}
		Song.Patterns[i] = {
			Length: Constants.MaxPatternLength,
			Tracks: Tracks
		}
	}
}

function GetSongPatternCell(Track, Step) {
	var Pattern = Song.Sequence[Song.SequenceStep]
	return Song.Patterns[Pattern].Tracks[Track][Step]
}
