"use strict"

var Ui = {
	FontWidth: 6,
	FontHeight: 6,
	FontImage: null
}

function InitUi() {
	Ui.FontImage = LoadImage("img/font.png")
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
