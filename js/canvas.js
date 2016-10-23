"use strict"

var Canvas = {
	Width: 0,
	Height: 0,
	OnDraw: null,
	Context: null,
	Images: []
}

function InitCanvas(ElementId) {
	var Element = document.getElementById(ElementId)
	var Context = Element.getContext("2d")
	Canvas.Width = Element.width
	Canvas.Height = Element.height
	Canvas.Context = Context
}

function LoadImage(Src) {
	var Id = Canvas.Images.length
	Canvas.Images[Id] = new Image()
	Canvas.Images[Id].src = Src
	return Id
}

function StartDrawing(OnDraw) {
	Canvas.OnDraw = OnDraw
	requestAnimationFrame(OnAnimationFrame)
}

function SetColor(R, G, B) {
	Canvas.Context.fillStyle = "rgb(" + R + "," + G + "," + B + ")"
}

function DrawRect(X, Y, Width, Height) {
	Canvas.Context.fillRect(X, Y, Width, Height)
}

function DrawImage(Id, Dx, Dy, Sx, Sy, Width, Height) {
	var Image = Canvas.Images[Id]
	if (Image) {
		Canvas.Context.drawImage(Image, Sx, Sy, Width, Height, Dx, Dy, Width, Height);
	}
}

function OnAnimationFrame() {
	Canvas.OnDraw()
	requestAnimationFrame(OnAnimationFrame)
}
