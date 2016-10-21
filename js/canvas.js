"use strict"

var Canvas = {}

function InitCanvas(ElementId) {
	var Element = document.getElementById(ElementId)
	var Context = Element.getContext("2d")
	Canvas.Width = Element.width
	Canvas.Height = Element.height
	Canvas.Context = Context
}

function SetColor(R, G, B) {
	Canvas.Context.fillStyle = "rgb(" + R + "," + G + "," + B + ")"
}

function DrawRect(X, Y, Width, Height) {
	Canvas.Context.fillRect(X, Y, Width, Height)
}
