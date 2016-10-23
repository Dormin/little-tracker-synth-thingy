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
	NoteKeep: -1,
	NoteCut: -2,
	IsPlaying: false,
	Bpm: 120,
	SamplesLeftInStep: 0,
	NextStep: 0,
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
				Row[k] = { Note: Tracker.NoteKeep }
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
	for (var i = 0; i < NumSamples; i++) {
		OutputL[i] = 0
		OutputR[i] = 0
	}

	if (Tracker.IsPlaying) {
		ProcessTrackerPlaying(OutputL, OutputR, NumSamples)
	} else {
		ProcessTrackerEditing(OutputL, OutputR, NumSamples)
	}
}

function ProcessTrackerPlaying(OutputL, OutputR, NumSamples) {
	var Pattern = Tracker.Patterns[Tracker.ActivePattern]
	var NumRows = Pattern.NumRows
	var StepsPerSecond = 4 * Tracker.Bpm / 60
	var SamplesPerStep = Audio.SampleRate / StepsPerSecond
	var SamplesLeftInBuffer = NumSamples
	var Offset = 0

	while (SamplesLeftInBuffer > 0) {
		if (Tracker.SamplesLeftInStep <= 0) {
			ProcessTrackerEvents()
			Tracker.SamplesLeftInStep += SamplesPerStep
			Tracker.CursorRow = Tracker.NextStep
			Tracker.NextStep++
			if (Tracker.NextStep >= NumRows) {
				Tracker.NextStep = 0
			}
			Tracker.NeedsToRedraw = true
		}

		var NumSamplesToProcess = Math.min(SamplesLeftInBuffer,
			Math.ceil(Tracker.SamplesLeftInStep))

		ProcessTrackerMixer(OutputL, OutputR, NumSamplesToProcess, Offset)
		Offset += NumSamplesToProcess
		Tracker.SamplesLeftInStep -= NumSamplesToProcess
		SamplesLeftInBuffer -= NumSamplesToProcess
	}
}

function ProcessTrackerEvents() {
	var Pattern = Tracker.Patterns[Tracker.ActivePattern]
	var Row = Pattern.Rows[Tracker.NextStep]
	var NumTracks = Tracker.NumTracks

	for (var i = 0; i < NumTracks; i++) {
		var Cell = Row[i]
		var Note = Cell.Note

		if (Note >= 0) {
			SynthNoteOn(i, Note)
		} else if (Note === Tracker.NoteCut) {
			SynthNoteOff(i)
		}
	}
}

function ProcessTrackerEditing(OutputL, OutputR, NumSamples) {
	ProcessTrackerMixer(OutputL, OutputR, NumSamples, 0)
}

function ProcessTrackerMixer(OutputL, OutputR, NumSamples, Offset) {
	var NumTracks = Tracker.NumTracks

	for (var i = 0; i < NumTracks; i++) {
		var Track = Tracker.Tracks[i]
		var BufferL = Track.BufferL
		var BufferR = Track.BufferR

		ProcessSynth(i, BufferL, BufferR, NumSamples)

		for (var j = 0; j < NumSamples; j++) {
			OutputL[j + Offset] += BufferL[j] / NumTracks
			OutputR[j + Offset] += BufferR[j] / NumTracks
		}
	}
}

function HandleTrackerInput(Event, Key) {
	if (Tracker.IsPlaying) {
		HandleTrackerPlayingInput(Event, Key)
	} else {
		HandleTrackerEditingInput(Event, Key)
	}
}

function HandleTrackerPlayingInput(Event, Key) {
	if (Event === "Press" && Key === "Spacebar") {
		SynthNoteOffAll()
		Tracker.IsPlaying = false
		Tracker.NeedsToRedraw = true
	}
}

function HandleTrackerEditingInput(Event, Key) {
	var KeyToNoteMap = Tracker.KeyToNoteMap
	var NumTracks = Tracker.NumTracks
	var Pattern = Tracker.Patterns[Tracker.ActivePattern]
	var NumRows = Pattern.NumRows

	if (Event === "Press" && Key === "Spacebar") {
		SynthNoteOffAll()
		Tracker.NextStep = 0
		Tracker.IsPlaying = true
		Tracker.SamplesLeftInStep = 0
		Tracker.NeedsToRedraw = true
	} else if (Event === "Press" || Event === "Repeat") {
		if (KeyToNoteMap.hasOwnProperty(Key)) {
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
		} else if (Key === "Dash") {
			var Row = Pattern.Rows[Tracker.CursorRow]
			var Cell = Row[Tracker.CursorCol]

			Cell.Note = Tracker.NoteKeep
			if (Tracker.CursorRow < NumRows - 1) {
				Tracker.CursorRow++
			}
			Tracker.NeedsToRedraw = true
		} else if (Key === "Period") {
			var Row = Pattern.Rows[Tracker.CursorRow]
			var Cell = Row[Tracker.CursorCol]

			Cell.Note = Tracker.NoteCut
			if (Tracker.CursorRow < NumRows - 1) {
				Tracker.CursorRow++
			}
			Tracker.NeedsToRedraw = true
		} else if (Key === "Left" && Tracker.CursorCol > 0) {
			Tracker.CursorCol--
			Tracker.NeedsToRedraw = true
		} else if (Key === "Right" && Tracker.CursorCol < NumTracks - 1) {
			Tracker.CursorCol++
			Tracker.NeedsToRedraw = true
		} else if (Key === "Up" && Tracker.CursorRow > 0) {
			Tracker.CursorRow--
			Tracker.NeedsToRedraw = true
		} else if (Key === "Down" && Tracker.CursorRow < NumRows - 1) {
			Tracker.CursorRow++
			Tracker.NeedsToRedraw = true
		}
	} else if (Event === "Release" && Tracker.CurrentKey === Key) {
		Tracker.CurrentKey = null
		for (var i = 0; i < Tracker.NumTracks; i++) {
			SynthNoteOff(i)
		}
	}
}

function DrawTracker() {
	HandleTrackerScrolling()
	if (!Tracker.NeedsToRedraw) {
		return
	}

	var ScrollOffset = Tracker.ScrollOffset
	var Pattern = Tracker.Patterns[Tracker.ActivePattern]
	var NumRows = Pattern.NumRows
	var Rows = Pattern.Rows
	var Y = 0

	SetAlpha(1.0)
	SetColor(54, 57, 73)
	DrawRect(0, 0, Canvas.Width, Canvas.Height)

	for (var i = ScrollOffset; i < ScrollOffset + NumRows && i < NumRows; i++) {
		if (i >= 0) {
			DrawTrackerRow(i, Y)
		}
		Y += Font.Height
	}

	Tracker.NeedsToRedraw = false
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

function DrawTrackerRow(Index, Y) {
	var Pattern = Tracker.Patterns[Tracker.ActivePattern]
	var Row = Pattern.Rows[Index]
	var X = Font.Width

	if (Tracker.IsPlaying && Index === Tracker.CursorRow) {
		SetAlpha(1.0)
		SetColor(57, 124, 172)
		DrawRect(0, Y, Canvas.Width, Font.Height)
	} else if (Index % 16 === 0) {
		SetAlpha(1.0)
		SetColor(71, 83, 108)
		DrawRect(0, Y, Canvas.Width, Font.Height)
	} else if (Index % 4 === 0) {
		SetAlpha(1.0)
		SetColor(63, 70, 90)
		DrawRect(0, Y, Canvas.Width, Font.Height)
	}

	SetAlpha(0.5)
	DrawNumber(Index, 2, X, Y)
	X += 3 * Font.Width

	for (var j = 0; j < Tracker.NumTracks; j++) {
		var Cell = Row[j]
		var Char = 45

		if (Index === Tracker.CursorRow && j === Tracker.CursorCol) {
			SetAlpha(1.0)
			SetColor(240, 16, 32)
			DrawRect(X, Y, 3 * Font.Width, Font.Height)
		}

		DrawTrackerNote(Cell.Note, X, Y)
		X += 6 * Font.Width
	}
}

function DrawTrackerNote(Note, X, Y) {
	if (Note === Tracker.NoteKeep) {
		var DashChar = 45
		SetAlpha(0.25)
		DrawChar(DashChar, X, Y)
		DrawChar(DashChar, X + Font.Width, Y)
		DrawChar(DashChar, X + 2 * Font.Width, Y)
	} else if (Note === Tracker.NoteCut) {
		SetAlpha(0.5)
		DrawChar(67, X, Y)
		DrawChar(85, X + Font.Width, Y)
		DrawChar(84, X + 2 * Font.Width, Y)
	} else {
		var Octave = Note / 12 | 0
		Note = (Note % 12 + 12) % 12
		var NoteChar = [67, 67, 68, 68, 69, 70, 70, 71, 71, 65, 65, 66][Note]
		var SharpChar = [45, 35, 45, 35, 45, 45, 35, 45, 35, 45, 35, 45][Note]
		SetAlpha(1.0)
		DrawChar(NoteChar, X, Y)
		DrawChar(SharpChar, X + Font.Width, Y)
		DrawDigit(Octave, X + 2 * Font.Width, Y)
	}
}

function DrawNumber(Number, NumDigits, X, Y) {
	X += NumDigits * Font.Width
	for (var i = 0; i < NumDigits; i++) {
		X -= Font.Width
		DrawDigit(Number % 10, X, Y)
		Number = Number / 10 | 0
	}
}

function DrawDigit(Digit, X, Y) {
	DrawChar(Digit + 48, X, Y)
}
