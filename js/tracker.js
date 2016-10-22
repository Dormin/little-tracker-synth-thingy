"use strict"

var Tracker = {
	NumTracks: 4,
	NumPatterns: 16,
	ActivePattern: 0,
	CursorCol: 0,
	CursorRow: 0,
	NeedsToRedraw: true,
	Tracks: [],
	Patterns: []
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

	HandleTrackerInput()

	if (Tracker.NeedsToRedraw) {
		DrawTracker()
	}
}

function HandleTrackerInput() {
	var NumTracks = Tracker.NumTracks
	var Pattern = Tracker.Patterns[Tracker.ActivePattern]
	var NumRows = Pattern.NumRows

	if (KeyIsRepeating("Left") && Tracker.CursorCol > 0) {
		Tracker.CursorCol--
		Tracker.NeedsToRedraw = true
	}
	if (KeyIsRepeating("Right") && Tracker.CursorCol < NumTracks - 1) {
		Tracker.CursorCol++
		Tracker.NeedsToRedraw = true
	}
	if (KeyIsRepeating("Up") && Tracker.CursorRow > 0) {
		Tracker.CursorRow--
		Tracker.NeedsToRedraw = true
	}
	if (KeyIsRepeating("Down") && Tracker.CursorRow < NumRows - 1) {
		Tracker.CursorRow++
		Tracker.NeedsToRedraw = true
	}
}

function DrawTracker() {
	var NumTracks = Tracker.NumTracks
	var CursorRow = Tracker.CursorRow
	var CursorCol = Tracker.CursorCol
	var Pattern = Tracker.Patterns[Tracker.ActivePattern]
	var NumRows = Pattern.NumRows
	var Rows = Pattern.Rows
	var Y = 0
	
	DrawRect(0, 0, Canvas.Width, Canvas.Height)

	for (var i = 0; i < NumRows; i++) {
		var Row = Rows[i]
		var X = Font.Width

		if (i % 16 === 0) {
			SetColor(71, 83, 108)
		} else if (i % 4 === 0) {
			SetColor(63, 70, 90)
		} else {
			SetColor(54, 57, 73)
		}

		DrawRect(0, Y, Canvas.Width, Font.Height)
		DrawNumber(i, 2, X, Y)
		X += 3 * Font.Width

		for (var j = 0; j < NumTracks; j++) {
			var Cell = Row[j]
			var Char = 45

			if (i === CursorRow && j === CursorCol) {
				SetColor(240, 16, 32)
				DrawRect(X, Y, 3 * Font.Width, Font.Height)
			}

			DrawChar(Char, X, Y)
			X += Font.Width
			DrawChar(Char, X, Y)
			X += Font.Width
			DrawChar(Char, X, Y)
			X += 4 * Font.Width
		}

		Y += Font.Height
	}

	Tracker.NeedsToRedraw = false
}

function DrawNumber(Number, NumDigits, X, Y) {
	X += NumDigits * Font.Width
	for (var i = 0; i < NumDigits; i++) {
		var Char = Number % 10 + 48
		X -= Font.Width
		DrawChar(Char, X, Y)
		Number = Number / 10 | 0
	}
}
