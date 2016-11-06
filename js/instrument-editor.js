"use strict"

var InstrumentEditor = {
	PositionY: 12,
	Height: 36,
	ActiveInstrument: 0,
	NeedsToRedraw: true
}

function InitInstrumentEditor() {
	
}

function DrawInstrumentEditor() {
	if (!InstrumentEditor.NeedsToRedraw) {
		return
	}

	var X = 0
	var Y = InstrumentEditor.PositionY
	var Width = Canvas.Width
	var Height = InstrumentEditor.Height

	DrawPanel(X, Y, Width, Height)
	DrawString("INSTRUMENT A:DEFAULT", X + 3, Y + 3)
	DrawHSeparator(X + 3, Y + 11, Width - 6)
	DrawString("VOL 100 PAN +00 DEC 000 DLY 030", X + 3, Y + 15)
	DrawString("POR 010 DET +00 INT 000 INT 000", X + 3, Y + 21)
	DrawString("CUT 100 RES 000 INT 000 SYN ON ", X + 3, Y + 27)
	DrawVSeparator(X + 24 * 6 - 1, Y + 15, Height - 18)

	InstrumentEditor.NeedsToRedraw = false
}
