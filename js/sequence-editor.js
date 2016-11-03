"use strict"

var SequenceEditor = {
	IsActive: false,
	PositionY: 48,
	Height: 12,
	NeedsToRedraw: true,
	NumVisibleSteps: 0,
	ScrollMargin: 0,
	ScrollOffset: 0
}

function InitSequenceEditor() {
	var Width = Canvas.Width
	SequenceEditor.NumVisibleSteps = Math.floor(Width / 2 / Ui.FontHeight)
}

function HandleSequenceEditorInput(Event, Key) {
	if (Event === "Press" && Key === "Mouse") {
		var X = Input.MouseX
		var Y = Input.MouseY
		var Left = 0
		var Right = Canvas.Width
		var Top = SequenceEditor.PositionY
		var Bottom = Top + SequenceEditor.Height
		SequenceEditor.IsActive = X >= Left && X < Right && Y >= Top && Y < Bottom
		SequenceEditor.NeedsToRedraw = true
	}

	if (!SequenceEditor.IsActive || SongPlayer.IsPlaying) {
		return
	}

	if (Event === "Press" || Event === "Repeat") {
		if (Key.length === 1) {
			var Pattern = Key.charCodeAt(0) - "A".charCodeAt(0)
			SetSequenceEditorStepPattern(Pattern)
		} else if (Key === "Insert") {
			InsertSequenceEditorStep()
		} else if (Key === "Delete") {
			DeleteSequenceEditorStep()
		} else if (Key === "Left") {
			MoveSequenceEditorCursorLeft()
		} else if (Key === "Right") {
			MoveSequenceEditorCursorRight()
		}
	}
}

function SetSequenceEditorStepPattern(Pattern) {
	if (Pattern >= 0 && Pattern < Constants.NumPatterns) {
		Song.Sequence[Song.SequenceStep] = Pattern
		SequenceEditor.NeedsToRedraw = true
	}
}

function InsertSequenceEditorStep() {
	if (Song.SequenceLength < Constants.MaxSequenceLength) {
		for (var Step = Song.SequenceLength; Step > Song.SequenceStep; Step--) {
			Song.Sequence[Step] = Song.Sequence[Step - 1]
		}
		Song.SequenceLength++
		SequenceEditor.NeedsToRedraw = true
	}
}

function DeleteSequenceEditorStep() {
	if (Song.SequenceStep < Song.SequenceLength - 1) {
		Song.SequenceLength--
		for (var Step = Song.SequenceStep; Step < Song.SequenceLength; Step++) {
			Song.Sequence[Step] = Song.Sequence[Step + 1]
		}
		SequenceEditor.NeedsToRedraw = true
	}
}

function MoveSequenceEditorCursorLeft() {
	if (Song.SequenceStep > 0) {
		Song.SequenceStep--
		SequenceEditor.NeedsToRedraw = true
	}
}

function MoveSequenceEditorCursorRight() {
	if (Song.SequenceStep < Song.SequenceLength - 1) {
		Song.SequenceStep++
		SequenceEditor.NeedsToRedraw = true
	}
}

function DrawSequenceEditor() {
	HandleSequenceEditorScrolling()
	if (!SequenceEditor.NeedsToRedraw) {
		return
	}

	var ScrollOffset = SequenceEditor.ScrollOffset
	var LastVisibleStep = ScrollOffset + SequenceEditor.NumVisibleSteps
	var NumSteps = Song.SequenceLength
	var StepWidth = 2 * Ui.FontWidth
	var X = 0
	var Y = SequenceEditor.PositionY
	var Width = Canvas.Width
	var Height = SequenceEditor.Height

	SetAlpha(1)
	SetColor(0, 0, 0)
	DrawRect(X, Y, Width, Height)

	for (var Step = ScrollOffset; Step < LastVisibleStep && Step < NumSteps; Step++) {
		if (Step >= 0) {
			DrawSequenceEditorStep(Step, X, Y)
		}
		X += StepWidth
	}

	X = 0
	DrawOuterBorder(X, Y, Width, Height)
	DrawInnerBorder(X + 1, Y + 1, Width - 2, Height - 2)

	SequenceEditor.NeedsToRedraw = false
}

function HandleSequenceEditorScrolling() {
	var Step = Song.SequenceStep
	var NumVisibleSteps = SequenceEditor.NumVisibleSteps
	var ScrollOffset = SequenceEditor.ScrollOffset
	var ScrollMargin = SequenceEditor.ScrollMargin
	var ScrollWindowLeft = ScrollOffset + ScrollMargin
	var ScrollWindowRight = ScrollOffset + NumVisibleSteps - ScrollMargin

	if (Step < ScrollWindowLeft) {
		SequenceEditor.ScrollOffset = Step - ScrollMargin
		SequenceEditor.NeedsToRedraw = true
	}

	if (Step > ScrollWindowRight - 1) {
		SequenceEditor.ScrollOffset = Step + ScrollMargin + 1 - NumVisibleSteps
		SequenceEditor.NeedsToRedraw = true
	}
}

function DrawSequenceEditorStep(Step, X, Y) {
	var StepWidth = 2 * Ui.FontWidth
	var StepHeight = 2 * Ui.FontHeight
	var Pattern = Song.Sequence[Step]
	var Char = Pattern + "A".charCodeAt(0)

	if (Step === Song.SequenceStep) {
		SetAlpha(1.0)
		if (SequenceEditor.IsActive) {
			SetColor(240, 16, 32)
		} else {
			SetColor(57, 124, 172)
		}
		DrawRect(X, Y, StepWidth, StepHeight)
	}

	DrawChar(Char, X + 3, Y + 3)
}
