"use strict"

var Tracker = {
	KeyToNoteMap: {
		"A": 0, // C
		"W": 1, // C#
		"S": 2, // D
		"E": 3, // D#
		"D": 4, // E
		"F": 5, // F
		"T": 6, // F#
		"G": 7, // G
		"Y": 8, // G#
		"H": 9, // A
		"U": 10, // A#
		"J": 11, // B
		"K": 12, // C
		"O": 13, // C#
		"L": 14, // D
		"P": 15 // D#
	},
	NumTracks: 4,
	NumPatterns: 16,
	ActivePattern: 0,
	CursorCol: 0,
	CursorRow: 0,
	CurrentOctave: 4,
	CurrentKey: null,
	NumVisibleRows: 0,
	ScrollMargin: 4,
	ScrollOffset: 0,
	NeedsToRedraw: true,
	Tracks: [],
	Patterns: []
}

function InitTracker() {
	Tracker.NumVisibleRows = Canvas.Height / Font.Height

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
	HandleTrackerScrolling()

	if (Tracker.NeedsToRedraw) {
		DrawTracker()
	}
}

function HandleTrackerInput() {
	var KeyToNoteMap = Tracker.KeyToNoteMap
	var NumTracks = Tracker.NumTracks
	var Pattern = Tracker.Patterns[Tracker.ActivePattern]
	var NumRows = Pattern.NumRows

	for (var Key in KeyToNoteMap) {
		if (KeyToNoteMap.hasOwnProperty(Key)) {
			if (KeyIsRepeating(Key)) {
				var Note = Tracker.CurrentOctave * 12 + KeyToNoteMap[Key]
				var Row = Pattern.Rows[Tracker.CursorRow]
				var Cell = Row[Tracker.CursorCol]
				Cell.Note = Note
				SynthNoteOn(Tracker.CursorCol, Note)
				Tracker.CurrentKey = Key
				if (Tracker.CursorRow < NumRows - 1) {
					Tracker.CursorRow++
				}
				Tracker.NeedsToRedraw = true
			}
		}
		if (Tracker.CurrentKey !== null && KeyWasReleased(Tracker.CurrentKey)) {
			Tracker.CurrentKey = null
			for (var i = 0; i < Tracker.NumTracks; i++) {
				SynthNoteOff(i)
			}
		}
	}

	if (Tracker.CurrentKey === null) {
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
}

function HandleTrackerScrolling() {
	var NumVisibleRows = Tracker.NumVisibleRows
	var ScrollMargin = Tracker.ScrollMargin
	var ScrollWindowTop = Tracker.ScrollOffset + ScrollMargin
	var ScrollWindowBottom = Tracker.ScrollOffset + NumVisibleRows - ScrollMargin
	if (Tracker.CursorRow < ScrollWindowTop) {
		Tracker.ScrollOffset = Tracker.CursorRow - ScrollMargin
		Tracker.NeedsToRedraw = true
	}
	if (Tracker.CursorRow > ScrollWindowBottom - 1) {
		Tracker.ScrollOffset = Tracker.CursorRow - Tracker.NumVisibleRows + ScrollMargin + 1
		Tracker.NeedsToRedraw = true
	}
}

function DrawTracker() {
	var NumTracks = Tracker.NumTracks
	var CursorRow = Tracker.CursorRow
	var CursorCol = Tracker.CursorCol
	var NumVisibleRows = Tracker.NumVisibleRows
	var ScrollOffset = Tracker.ScrollOffset
	var Pattern = Tracker.Patterns[Tracker.ActivePattern]
	var NumRows = Pattern.NumRows
	var Rows = Pattern.Rows
	var Y = 0

	SetColor(54, 57, 73)
	DrawRect(0, 0, Canvas.Width, Canvas.Height)

	for (var i = ScrollOffset; i < ScrollOffset + NumRows && i < NumRows; i++) {
		if (i >= 0) {
			var Row = Rows[i]
			var X = Font.Width

			if (i % 16 === 0) {
				SetColor(71, 83, 108)
				DrawRect(0, Y, Canvas.Width, Font.Height)
			} else if (i % 4 === 0) {
				SetColor(63, 70, 90)
				DrawRect(0, Y, Canvas.Width, Font.Height)
			}

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
