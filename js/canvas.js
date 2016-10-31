"use strict"

var Canvas = {
	Width: 0,
	Height: 0,
	PixelWidth: 0,
	PixelHeight: 0,
	OnDraw: null,
	Context: null
}

function InitCanvas(ElementId) {
	var Element = document.getElementById(ElementId)
	var Context = Element.getContext("2d")
	Canvas.Width = Element.width
	Canvas.Height = Element.height
	Canvas.PixelWidth = Element.clientWidth / Element.width
	Canvas.PixelHeight = Element.clientHeight / Element.height
	Canvas.Context = Context
}

function GetCanvasPositionX() {
	return Canvas.Context.canvas.offsetLeft
}

function GetCanvasPositionY() {
	return Canvas.Context.canvas.offsetTop
}

function StartDrawing(OnDraw) {
	Canvas.OnDraw = OnDraw
	requestAnimationFrame(OnAnimationFrame)
}

function SetAlpha(Alpha) {
	Canvas.Context.globalAlpha = Alpha
}

function SetColor(R, G, B) {
	Canvas.Context.fillStyle = "rgb(" + R + "," + G + "," + B + ")"
}

function DrawRect(X, Y, Width, Height) {
	Canvas.Context.fillRect(X, Y, Width, Height)
}

function DrawImage(Id, Dx, Dy, Sx, Sy, Width, Height) {
	var Image = Resources.Images[Id]
	if (Image) {
		Canvas.Context.drawImage(Image, Sx, Sy, Width, Height, Dx, Dy, Width, Height);
	}
}

function OnAnimationFrame() {
	Canvas.OnDraw()
	requestAnimationFrame(OnAnimationFrame)
}
