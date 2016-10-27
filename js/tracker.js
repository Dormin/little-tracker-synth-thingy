"use strict"

var Tracker = {
	KeyToOctaveMap: {
		"0": 0, "1": 1, "2": 2, "3": 3, "4": 4,
		"5": 5, "6": 6, "7": 7, "8": 8, "9": 9
	},
	KeyToNoteMap: {
		"A": 0, "W": 1, "S": 2, "E": 3, "D": 4, "F": 5, "T": 6, "G": 7,
		"Y": 8, "H": 9, "U": 10, "J": 11, "K": 12, "O": 13, "L": 14, "P": 15
	},
	NumTracks: 4,
	NumPatterns: 16,
	PageStepSize: 8,
	ScrollMargin: 4,
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
	ScrollOffset: 0,
	NeedsToRedraw: true,
	Tracks: [],
	Patterns: []
}

function InitTracker() {
	Tracker.NumVisibleRows = Canvas.Height / Ui.FontHeight

	for (var i = 0; i < Tracker.NumPatterns; i++) {
		var NumRows = 64
		var Tracks = []

		for (var j = 0; j < Tracker.NumTracks; j++) {
			var Track = []

			for (var k = 0; k < NumRows; k++) {
				Track[k] = { Note: Tracker.NoteKeep }
			}

			Tracks[j] = Track
		}

		Tracker.Patterns[i] = {
			NumRows: NumRows,
			Tracks: Tracks
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
	var Pattern = GetTrackerActivePattern()
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
	var Pattern = GetTrackerActivePattern()

	for (var i = 0; i < Tracker.NumTracks; i++) {
		var Cell = Pattern.Tracks[i][Tracker.NextStep]
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
		TrackerStop()
	}
}

function HandleTrackerEditingInput(Event, Key) {
	var KeyToOctaveMap = Tracker.KeyToOctaveMap
	var KeyToNoteMap = Tracker.KeyToNoteMap

	if (Event === "Press" && Key === "Spacebar") {
		TrackerPlay()
	} else if (Event === "Press" || Event === "Repeat") {
		if (KeyToOctaveMap.hasOwnProperty(Key)) {
			var Octave = KeyToOctaveMap[Key]
			TrackerChangeOctave(Octave)
		} else if (KeyToNoteMap.hasOwnProperty(Key)) {
			var Note = Tracker.CurrentOctave * 12 + KeyToNoteMap[Key]
			TrackerInsertNote(Note)
			Tracker.CurrentKey = Key
			SynthNoteOn(Tracker.CursorCol, Note)
		} else if (Key === "Dash") {
			TrackerInsertNote(Tracker.NoteKeep)
		} else if (Key === "Period") {
			TrackerInsertNote(Tracker.NoteCut)
		} else if (Key === "Insert") {
			TrackerPushNotes()
		} else if (Key === "Delete") {
			TrackerDeleteNote()
		} else if (Key === "Left") {
			TrackerMoveCursorLeft()
		} else if (Key === "Right") {
			TrackerMoveCursorRight()
		} else if (Key === "Up") {
			TrackerMoveCursorUp()
		} else if (Key === "Down") {
			TrackerMoveCursorDown()
		} else if (Key === "Page Up") {
			TrackerMoveCursorPageUp()
		} else if (Key === "Page Down") {
			TrackerMoveCursorPageDown()
		} else if (Key === "End") {
			TrackerMoveCursorToEnd()
		} else if (Key === "Home") {
			TrackerMoveCursorToBeginning()
		}
	} else if (Event === "Release" && Tracker.CurrentKey === Key) {
		Tracker.CurrentKey = null
		SynthNoteOffAll()
	}
}

function TrackerPlay() {
	SynthNoteOffAll()
	Tracker.NextStep = 0
	Tracker.IsPlaying = true
	Tracker.SamplesLeftInStep = 0
	Tracker.NeedsToRedraw = true
}

function TrackerStop() {
	SynthNoteOffAll()
	Tracker.IsPlaying = false
	Tracker.NeedsToRedraw = true
}

function TrackerChangeOctave(Octave) {
	var Cell = GetTrackerSelectedCell()
	Tracker.CurrentOctave = Octave
	if (Cell.Note >= 0) {
		Cell.Note = Octave * 12 + Cell.Note % 12
		TrackerMoveCursorDown()
		Tracker.NeedsToRedraw = true
	}
}

function TrackerInsertNote(Note) {
	var Cell = GetTrackerSelectedCell()
	Cell.Note = Note
	TrackerMoveCursorDown()
	Tracker.NeedsToRedraw = true
}

function TrackerPushNotes() {
	var Pattern = GetTrackerActivePattern()
	var Track = Pattern.Tracks[Tracker.CursorCol]
	var LastRow = Pattern.NumRows - 1
	for (var i = LastRow; i > Tracker.CursorRow; i--) {
		Track[i].Note = Track[i - 1].Note
	}
	Track[Tracker.CursorRow].Note = Tracker.NoteKeep
	Tracker.NeedsToRedraw = true
}

function TrackerDeleteNote() {
	var Pattern = GetTrackerActivePattern()
	var Track = Pattern.Tracks[Tracker.CursorCol]
	var LastRow = Pattern.NumRows - 1
	for (var i = Tracker.CursorRow; i < LastRow; i++) {
		Track[i].Note = Track[i + 1].Note
	}
	Track[LastRow].Note = Tracker.NoteKeep
	Tracker.NeedsToRedraw = true
}

function TrackerMoveCursorLeft() {
	if (Tracker.CursorCol > 0) {
		Tracker.CursorCol--
		Tracker.NeedsToRedraw = true
	}
}

function TrackerMoveCursorRight() {
	if (Tracker.CursorCol < Tracker.NumTracks - 1) {
		Tracker.CursorCol++
		Tracker.NeedsToRedraw = true
	}
}

function TrackerMoveCursorUp() {
	var FirstRow = 0
	if (Tracker.CursorRow > FirstRow) {
		Tracker.CursorRow--
		Tracker.NeedsToRedraw = true
	}
}

function TrackerMoveCursorDown() {
	var LastRow = GetTrackerActivePattern().NumRows - 1
	if (Tracker.CursorRow < LastRow) {
		Tracker.CursorRow++
		Tracker.NeedsToRedraw = true
	}
}

function TrackerMoveCursorPageDown() {
	var LastRow = GetTrackerActivePattern().NumRows - 1
	Tracker.CursorRow += Tracker.PageStepSize
	if (Tracker.CursorRow > LastRow) {
		Tracker.CursorRow = LastRow
	}
	Tracker.NeedsToRedraw = true
}

function TrackerMoveCursorPageUp() {
	var FirstRow = 0
	Tracker.CursorRow -= Tracker.PageStepSize
	if (Tracker.CursorRow < FirstRow) {
		Tracker.CursorRow = FirstRow
	}
	Tracker.NeedsToRedraw = true
}

function TrackerMoveCursorToEnd() {
	var LastRow = GetTrackerActivePattern().NumRows - 1
	Tracker.CursorRow = LastRow
	Tracker.NeedsToRedraw = true
}

function TrackerMoveCursorToBeginning() {
	var FirstRow = 0
	Tracker.CursorRow = FirstRow
	Tracker.NeedsToRedraw = true
}

function DrawTracker() {
	HandleTrackerScrolling()
	if (!Tracker.NeedsToRedraw) {
		return
	}

	var ScrollOffset = Tracker.ScrollOffset
	var Pattern = GetTrackerActivePattern()
	var NumRows = Pattern.NumRows
	var Y = 0

	SetAlpha(1.0)
	SetColor(54, 57, 73)
	DrawRect(0, 0, Canvas.Width, Canvas.Height)

	for (var i = ScrollOffset; i < ScrollOffset + NumRows && i < NumRows; i++) {
		if (i >= 0) {
			DrawTrackerRow(i, Y)
		}
		Y += Ui.FontHeight
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
	var Pattern = GetTrackerActivePattern()
	var X = Ui.FontWidth

	if (Tracker.IsPlaying && Index === Tracker.CursorRow) {
		SetAlpha(1.0)
		SetColor(57, 124, 172)
		DrawRect(0, Y, Canvas.Width, Ui.FontHeight)
	} else if (Index % 16 === 0) {
		SetAlpha(1.0)
		SetColor(71, 83, 108)
		DrawRect(0, Y, Canvas.Width, Ui.FontHeight)
	} else if (Index % 4 === 0) {
		SetAlpha(1.0)
		SetColor(63, 70, 90)
		DrawRect(0, Y, Canvas.Width, Ui.FontHeight)
	}

	SetAlpha(0.5)
	DrawNumber(Index, 2, X, Y)
	X += 3 * Ui.FontWidth

	for (var j = 0; j < Tracker.NumTracks; j++) {
		var Cell = Pattern.Tracks[j][Index]
		var Char = 45

		if (Index === Tracker.CursorRow && j === Tracker.CursorCol) {
			SetAlpha(1.0)
			SetColor(240, 16, 32)
			DrawRect(X, Y, 3 * Ui.FontWidth, Ui.FontHeight)
		}

		DrawTrackerNote(Cell.Note, X, Y)
		X += 6 * Ui.FontWidth
	}
}

function DrawTrackerNote(Note, X, Y) {
	if (Note === Tracker.NoteKeep) {
		var DashChar = 45
		SetAlpha(0.25)
		DrawChar(DashChar, X, Y)
		DrawChar(DashChar, X + Ui.FontWidth, Y)
		DrawChar(DashChar, X + 2 * Ui.FontWidth, Y)
	} else if (Note === Tracker.NoteCut) {
		SetAlpha(0.5)
		DrawChar(67, X, Y)
		DrawChar(85, X + Ui.FontWidth, Y)
		DrawChar(84, X + 2 * Ui.FontWidth, Y)
	} else {
		var Octave = Note / 12 | 0
		Note = (Note % 12 + 12) % 12
		var NoteChar = [67, 67, 68, 68, 69, 70, 70, 71, 71, 65, 65, 66][Note]
		var SharpChar = [45, 35, 45, 35, 45, 45, 35, 45, 35, 45, 35, 45][Note]
		SetAlpha(1.0)
		DrawChar(NoteChar, X, Y)
		DrawChar(SharpChar, X + Ui.FontWidth, Y)
		DrawDigit(Octave, X + 2 * Ui.FontWidth, Y)
	}
}

function GetTrackerSelectedCell() {
	var Pattern = GetTrackerActivePattern()
	var Track = Pattern.Tracks[Tracker.CursorCol]
	return Track[Tracker.CursorRow]
}

function GetTrackerActivePattern() {
	return Tracker.Patterns[Tracker.ActivePattern]
}
