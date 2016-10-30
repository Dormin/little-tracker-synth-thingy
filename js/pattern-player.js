"use strict"

var PatternPlayer = {
	IsPlaying: false,
	ActivePattern: 0,
	CurrentStep: 0,
	NextStep: 0
}

function InitPatternPlayer() {

}

function SetPatternPlayerPattern(Pattern) {
	PatternPlayer.ActivePattern = Pattern
	PatternPlayer.CurrentStep = 0
	PatternPlayer.NextStep = 0
}

function StartPatternPlayer() {
	PatternPlayer.IsPlaying = true
	PatternPlayer.CurrentStep = 0
	PatternPlayer.NextStep = 0
	SynthNoteOffAll()
}

function StopPatternPlayer() {
	PatternPlayer.IsPlaying = false
	SynthNoteOffAll()
}

function HandlePatternPlayerStep() {
	var Pattern = PatternPlayer.ActivePattern
	var Step = PatternPlayer.NextStep

	PatternPlayer.CurrentStep = Step
	PatternPlayer.NextStep = (Step + 1) % Constants.MaxPatternLength

	for (var Track = 0; Track < Constants.NumTracks; Track++) {
		var Cell = GetPatternCell(Pattern, Track, Step)
		var Note = Cell.Note

		if (Note >= 0) {
			SynthNoteOn(Track, Note)
		} else if (Note === Constants.NoteCut) {
			SynthNoteOff(Track)
		}
	}
}
