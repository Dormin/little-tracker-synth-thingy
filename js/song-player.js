"use strict"

var SongPlayer = {
	IsPlaying: false,
	NextPatternStep: 0
}

function InitSongPlayer() {

}

function StartSongPlayer() {
	SongPlayer.IsPlaying = true
	SongPlayer.NextPatternStep = 0
	Song.PatternStep = 0
	SynthNoteOffAll()
}

function StopSongPlayer() {
	SongPlayer.IsPlaying = false
	SynthNoteOffAll()
}

function HandleSongPlayerStep() {
	Song.PatternStep = SongPlayer.NextPatternStep

	if (Song.PatternStep >= Constants.MaxPatternLength) {
		Song.PatternStep = 0
		Song.SequenceStep++
		if (Song.SequenceStep >= Song.SequenceLength) {
			Song.SequenceStep = 0
		}
	}

	SongPlayer.NextPatternStep = Song.PatternStep + 1

	for (var Track = 0; Track < Constants.NumTracks; Track++) {
		var Cell = GetSongPatternCell(Track, Song.PatternStep)
		var Note = Cell.Note

		if (Note >= 0) {
			SynthNoteOn(Track, Note)
		} else if (Note === Constants.NoteCut) {
			SynthNoteOff(Track)
		}
	}
}
