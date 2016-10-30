"use strict"

var SongEditor = {
	PositionY: 48,
	Height: 12,
	NeedsToRedraw: true
}

function InitSongEditor() {

}

function DrawSongEditor() {
	if (!SongEditor.NeedsToRedraw) {
		return
	}

	var X = 0
	var Y = SongEditor.PositionY
	var Width = Canvas.Width
	var Height = SongEditor.Height

	SetAlpha(1)
	SetColor(0, 0, 0)
	DrawRect(X, Y, Width, Height)

	SetColor(57, 124, 172)
	DrawRect(X + 6, Y, 12, 12)

	DrawOuterBorder(X, Y, Width, Height)
	DrawInnerBorder(X + 1, Y + 1, Width - 2, Height - 2)

	DrawString("A A B C", X + 9, Y + 3)

	SongEditor.NeedsToRedraw = false
}
