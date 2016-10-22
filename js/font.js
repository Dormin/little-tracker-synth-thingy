"use strict"

var Font = {
	Width: 6,
	Height: 6,
	Image: null
}

function InitFont() {
	Font.Image = LoadImage("img/font.png")
}

function DrawChar(Char, X, Y) {
	var Index = Char - 32
	DrawImage(Font.Image, X, Y, Index * 6, 0, 6, 6)
}
