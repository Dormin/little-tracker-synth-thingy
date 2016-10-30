"use strict"

var PatternEditor = {
	KeyToOctaveMap: {
		"0": 0, "1": 1, "2": 2, "3": 3, "4": 4,
		"5": 5, "6": 6, "7": 7, "8": 8, "9": 9
	},
	KeyToNoteMap: {
		"A": 0, "W": 1, "S": 2, "E": 3, "D": 4, "F": 5, "T": 6, "G": 7,
		"Y": 8, "H": 9, "U": 10, "J": 11, "K": 12, "O": 13, "L": 14, "P": 15
	},
	PageStepSize: 8,
	ActivePattern: 0,
	CursorTrack: 0,
	CursorStep: 0,
	CurrentOctave: 4,
	CurrentKey: null,
	NeedsToRedraw: true,
	PositionY: 60,
	NumVisibleRows: 0,
	ScrollMargin: 4,
	ScrollOffset: 0
}

function InitPatternEditor() {
	var Height = Canvas.Height - PatternEditor.PositionY
	PatternEditor.NumVisibleRows = Math.floor(Height / Ui.FontHeight)
}

function SetPatternEditorPattern(Pattern) {
	PatternEditor.ActivePattern = Pattern
}

function HandlePatternEditorInput(Event, Key) {
	if (PatternPlayer.IsPlaying) {
		return
	}

	var KeyToOctaveMap = PatternEditor.KeyToOctaveMap
	var KeyToNoteMap = PatternEditor.KeyToNoteMap

	if (Event === "Press" || Event === "Repeat") {
		if (KeyToOctaveMap.hasOwnProperty(Key)) {
			var Octave = KeyToOctaveMap[Key]
			ChangePatternEditorOctave(Octave)
		} else if (KeyToNoteMap.hasOwnProperty(Key)) {
			var Note = PatternEditor.CurrentOctave * 12 + KeyToNoteMap[Key]
			InsertPatternEditorNote(Note)
			PatternEditor.CurrentKey = Key
			SynthNoteOn(PatternEditor.CursorTrack, Note)
		} else if (Key === "Dash") {
			InsertPatternEditorNote(Constants.NoteKeep)
		} else if (Key === "Period") {
			InsertPatternEditorNote(Constants.NoteCut)
		} else if (Key === "Insert") {
			PushPatternEditorNotes()
		} else if (Key === "Delete") {
			DeletePatternEditorNote()
		} else if (Key === "Left") {
			MovePatternEditorCursorLeft()
		} else if (Key === "Right") {
			MovePatternEditorCursorRight()
		} else if (Key === "Up") {
			MovePatternEditorCursorUp()
		} else if (Key === "Down") {
			MovePatternEditorCursorDown()
		} else if (Key === "Page Up") {
			MovePatternEditorCursorPageUp()
		} else if (Key === "Page Down") {
			MovePatternEditorCursorPageDown()
		} else if (Key === "End") {
			MovePatternEditorCursorToEnd()
		} else if (Key === "Home") {
			MovePatternEditorCursorToBeginning()
		}
	} else if (Event === "Release" && PatternEditor.CurrentKey === Key) {
		PatternEditor.CurrentKey = null
		SynthNoteOffAll()
	}
}

function ChangePatternEditorOctave(Octave) {
	var Cell = GetPatternEditorSelectedCell()
	PatternEditor.CurrentOctave = Octave
	if (Cell.Note >= 0) {
		Cell.Note = Octave * 12 + Cell.Note % 12
		MovePatternEditorCursorDown()
		PatternEditor.NeedsToRedraw = true
	}
}

function InsertPatternEditorNote(Note) {
	var Cell = GetPatternEditorSelectedCell()
	Cell.Note = Note
	MovePatternEditorCursorDown()
	PatternEditor.NeedsToRedraw = true
}

function PushPatternEditorNotes() {
	var Track = PatternEditor.CursorTrack
	var LastStep = Constants.MaxPatternLength - 1
	for (var Step = LastStep; Step > PatternEditor.CursorStep; Step--) {
		var Cell1 = GetPatternEditorCell(Track, Step)
		var Cell2 = GetPatternEditorCell(Track, Step - 1)
		Cell1.Note = Cell2.Note
	}
	GetPatternEditorSelectedCell().Note = Constants.NoteKeep
	PatternEditor.NeedsToRedraw = true
}

function DeletePatternEditorNote() {
	var Track = PatternEditor.CursorTrack
	var LastStep = Constants.MaxPatternLength - 1
	for (var Step = PatternEditor.CursorStep; Step < LastStep; Step++) {
		var Cell1 = GetPatternEditorCell(Track, Step)
		var Cell2 = GetPatternEditorCell(Track, Step + 1)
		Cell1.Note = Cell2.Note
	}
	GetPatternEditorCell(Track, LastStep).Note = Constants.NoteKeep
	PatternEditor.NeedsToRedraw = true
}

function MovePatternEditorCursorLeft() {
	MovePatternEditorCursor(-1, 0)
}

function MovePatternEditorCursorRight() {
	MovePatternEditorCursor(1, 0)
}

function MovePatternEditorCursorUp() {
	MovePatternEditorCursor(0, -1)
}

function MovePatternEditorCursorDown() {
	MovePatternEditorCursor(0, 1)
}

function MovePatternEditorCursorPageUp() {
	MovePatternEditorCursor(0, -PatternEditor.PageStepSize)
}

function MovePatternEditorCursorPageDown() {
	MovePatternEditorCursor(0, PatternEditor.PageStepSize)
}

function MovePatternEditorCursorToEnd() {
	PatternEditor.CursorStep = Constants.MaxPatternLength - 1
	PatternEditor.NeedsToRedraw = true
}

function MovePatternEditorCursorToBeginning() {
	PatternEditor.CursorStep = 0
	PatternEditor.NeedsToRedraw = true
}

function MovePatternEditorCursor(DTracks, DSteps) {
	var LastTrack = Constants.NumTracks - 1
	var LastStep = Constants.MaxPatternLength - 1
	PatternEditor.CursorTrack = Clamp(PatternEditor.CursorTrack + DTracks, 0, LastTrack)
	PatternEditor.CursorStep = Clamp(PatternEditor.CursorStep + DSteps, 0, LastStep)
	PatternEditor.NeedsToRedraw = true
}

function DrawPatternEditor() {
	HandlePatternEditorScrolling()
	if (!PatternEditor.NeedsToRedraw) {
		return
	}

	var ScrollOffset = PatternEditor.ScrollOffset
	var LastVisibleRow = ScrollOffset + PatternEditor.NumVisibleRows
	var NumRows = Constants.MaxPatternLength
	var RowHeight = Ui.FontHeight
	var X = 0
	var Y = PatternEditor.PositionY
	var Width = Canvas.Width
	var Height = Canvas.Height - Y

	SetAlpha(1.0)
	SetColor(0, 0, 0)
	//SetColor(54, 57, 73)
	DrawRect(X, Y, Width, Height)

	for (var Row = ScrollOffset; Row < LastVisibleRow && Row < NumRows; Row++) {
		if (Row >= 0) {
			DrawPatternEditorRow(Row, X, Y)
		}
		Y += RowHeight
	}

	PatternEditor.NeedsToRedraw = false
}

function HandlePatternEditorScrolling() {
	var Step = PatternPlayer.IsPlaying ? PatternPlayer.CurrentStep : PatternEditor.CursorStep
	var NumVisibleRows = PatternEditor.NumVisibleRows
	var ScrollOffset = PatternEditor.ScrollOffset
	var ScrollMargin = PatternEditor.ScrollMargin
	var ScrollWindowTop = ScrollOffset + ScrollMargin
	var ScrollWindowBottom = ScrollOffset + NumVisibleRows - ScrollMargin

	if (Step < ScrollWindowTop) {
		PatternEditor.ScrollOffset = Step - ScrollMargin
		PatternEditor.NeedsToRedraw = true
	}

	if (Step > ScrollWindowBottom - 1) {
		PatternEditor.ScrollOffset = Step + ScrollMargin + 1 - NumVisibleRows
		PatternEditor.NeedsToRedraw = true
	}
}

function DrawPatternEditorRow(Row, X, Y) {
	var CharWidth = Ui.FontWidth
	var RowHeight = Ui.FontHeight

	if (PatternPlayer.IsPlaying && Row === PatternPlayer.CurrentStep) {
		SetAlpha(1.0)
		SetColor(57, 124, 172)
		DrawRect(0, Y, Canvas.Width, RowHeight)
	} else if (Row % 16 === 0) {
		SetAlpha(0.5)
		SetColor(71, 83, 108)
		DrawRect(0, Y, Canvas.Width, RowHeight)
	} else if (Row % 4 === 0) {
		SetAlpha(0.5)
		SetColor(63, 70, 90)
		DrawRect(0, Y, Canvas.Width, RowHeight)
	}

	X += CharWidth
	SetAlpha(0.5)
	DrawNumber(Row, 2, X, Y)
	X += 3 * CharWidth

	for (var Track = 0; Track < Constants.NumTracks; Track++) {
		var Cell = GetPatternEditorCell(Track, Row)

		if (!PatternPlayer.IsPlaying && Row === PatternEditor.CursorStep &&
			Track === PatternEditor.CursorTrack) {
			SetAlpha(1.0)
			SetColor(240, 16, 32)
			DrawRect(X, Y, 3 * CharWidth, RowHeight)
		}

		DrawPatternEditorNote(Cell.Note, X, Y)
		X += 6 * CharWidth
	}
}

function DrawPatternEditorNote(Note, X, Y) {
	if (Note === Constants.NoteKeep) {
		SetAlpha(0.25)
		DrawString("---", X, Y)
	} else if (Note === Constants.NoteCut) {
		SetAlpha(0.5)
		DrawString("CUT", X, Y)
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

function GetPatternEditorSelectedCell() {
	var Track = PatternEditor.CursorTrack
	var Step = PatternEditor.CursorStep
	return GetPatternEditorCell(Track, Step)
}

function GetPatternEditorCell(Track, Step) {
	var Pattern = PatternEditor.ActivePattern
	return GetPatternCell(Pattern, Track, Step)
}

function Clamp(Value, Lower, Upper) {
	return Math.min(Math.max(Value, Lower), Upper)
}
