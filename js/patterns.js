"use strict"

var Patterns = []

function InitPatterns() {
	for (var i = 0; i < Constants.NumPatterns; i++) {
		var Tracks = []
		for (var j = 0; j < Constants.NumTracks; j++) {
			var Track = []
			for (var k = 0; k < Constants.MaxPatternLength; k++) {
				Track[k] = { Note: Constants.NoteKeep }
			}
			Tracks[j] = Track
		}
		Patterns[i] = {
			Length: Constants.MaxPatternLength,
			Tracks: Tracks
		}
	}
}

function GetPatternCell(Pattern, Track, Step) {
	return Patterns[Pattern].Tracks[Track][Step]
}
