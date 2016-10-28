"use strict"

var Ui = {
	FontWidth: 6,
	FontHeight: 6,
	FontImage: null
}

function InitUi() {
	Ui.FontImage = LoadImage("img/font.png")
}

function DrawPanel(X, Y, Width, Height) {
	SetAlpha(1)
	SetColor(71, 83, 108)
	DrawRect(X, Y, Width, Height)
	SetColor(57, 124, 172)
	DrawRect(X, Y, Width, 1)
	DrawRect(X, Y, 1, Height)
	SetColor(45, 46, 57)
	DrawRect(X, Y + Height - 1, Width, 1)
	DrawRect(X + Width - 1, Y, 1, Height)
}

function DrawHSeparator(X, Y, Width) {
	DrawPanel(X, Y, Width, 2)
}

function DrawVSeparator(X, Y, Height) {
	DrawPanel(X, Y, 2, Height)
}

function DrawString(String, X, Y) {
	var Length = String.length
	for (var i = 0; i < Length; i++) {
		var Char = String.charCodeAt(i)
		DrawChar(Char, X, Y)
		X += Ui.FontWidth
	}
}

function DrawNumber(Number, NumDigits, X, Y) {
	X += NumDigits * Ui.FontWidth
	for (var i = 0; i < NumDigits; i++) {
		X -= Ui.FontWidth
		DrawDigit(Number % 10, X, Y)
		Number = Number / 10 | 0
	}
}

function DrawDigit(Digit, X, Y) {
	DrawChar(Digit + 48, X, Y)
}

function DrawChar(Char, X, Y) {
	var Width = Ui.FontWidth
	var Height = Ui.FontHeight
	var Index = Char - 32
	DrawImage(Ui.FontImage, X, Y, Index * Width, 0, Width, Height)
}
