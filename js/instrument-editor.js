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

	var Instrument = Song.Instruments[InstrumentEditor.ActiveInstrument]
	var Left = 0
	var Top = InstrumentEditor.PositionY
	var Width = Canvas.Width
	var Height = InstrumentEditor.Height
	var X = Left
	var Y = Top
	var Dx = Ui.FontWidth
	var Dy = Ui.FontHeight

	DrawPanel(X, Y, Width, Height)
	DrawHSeparator(X + 3, Y + 11, Width - 6)
	DrawVSeparator(X + 24 * Dx - 1, Y + 15, Height - 18)

	X += 3
	Y += 3
	DrawString("INSTRUMENT A:", X, Y)
	DrawString(Instrument.Name, X + 13 * Dx, Y)
	
	X = Left + 3
	Y += 2 * Dy
	DrawInstrumentEditorProperty("VOL", Instrument.Volume, X, Y)
	X += 8 * Dx
	DrawInstrumentEditorProperty("PAN", Instrument.Pan, X, Y)
	X += 8 * Dx
	DrawInstrumentEditorProperty("DEC", Instrument.EgDecay, X, Y)

	X = Left + 3
	Y += Dy
	DrawInstrumentEditorProperty("POR", Instrument.VcoPortamento, X, Y)
	X += 8 * Dx
	DrawInstrumentEditorProperty("DET", Instrument.Vco2Detune, X, Y)
	X += 8 * Dx
	DrawInstrumentEditorProperty("INT", Instrument.VcoEgInt, X, Y)

	X = Left + 3
	Y += Dy
	DrawInstrumentEditorProperty("CUT", Instrument.VcfCutoff, X, Y)
	X += 8 * Dx
	DrawInstrumentEditorProperty("RES", Instrument.VcfResonance, X, Y)
	X += 8 * Dx
	DrawInstrumentEditorProperty("INT", Instrument.VcfEgInt, X, Y)
	
	InstrumentEditor.NeedsToRedraw = false
}

function DrawInstrumentEditorProperty(Name, Value, X, Y) {
	DrawString(Name, X, Y)
	DrawNumber(Value, 3, X + (Name.length + 1) * Ui.FontWidth, Y)
}
