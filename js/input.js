"use strict"

var Input = {
	RepeatDelay: 0.5,
	RepeatStep: 0.05,
	OnInput: null,
	IsHeldNext: {},
	IsHeld: {},
	WasPressed: {},
	WasReleased: {},
	LastPressed: null,
	LastIsRepeating: false,
	RepeatTime: 0,
	Time: null
}

function InitInput() {
	
}

function StartInput(OnInput) {
	Input.OnInput = OnInput
	document.body.onkeydown = OnKeyDown
	document.body.onkeyup = OnKeyUp
	document.body.onmousedown = OnMouseDown
	document.body.onmouseup = OnMouseUp
}

function OnKeyDown(Event) {
	var Key = KeyCodeToString(Event.keyCode)
	HandleKeyDown(Key, 0, 0)
}

function OnKeyUp(Event) {
	var Key = KeyCodeToString(Event.keyCode)
	HandleKeyUp(Key, 0, 0)
}

function OnMouseDown(Event) {
	var X = Math.floor((Event.pageX - GetCanvasPositionX()) / Canvas.PixelWidth)
	var Y = Math.floor((Event.pageY - GetCanvasPositionY()) / Canvas.PixelHeight)
	HandleKeyDown("Mouse", X, Y)
}

function OnMouseUp(Event) {
	var X = Math.floor((Event.pageX - GetCanvasPositionX()) / Canvas.PixelWidth)
	var Y = Math.floor((Event.pageY - GetCanvasPositionY()) / Canvas.PixelHeight)
	HandleKeyUp("Mouse", X, Y)
}

function HandleKeyDown(Key, X, Y) {
	var Time = performance.now() / 1000
	
	if (!Input.IsHeld[Key]) {
		Input.IsHeld[Key] = true
		Input.LastPressed = Key
		Input.RepeatTime = Input.RepeatDelay
		Input.Time = Time
		Input.OnInput("Press", Key, X, Y)
	} else if (Input.LastPressed === Key) {
		var DeltaTime = Time - Input.Time
		Input.Time = Time
		Input.RepeatTime -= DeltaTime
		if (Input.RepeatTime <= 0) {
			Input.RepeatTime += Input.RepeatStep
			Input.OnInput("Repeat", Key, X, Y)
		}
	}
}

function HandleKeyUp(Key, X, Y) {
	Input.IsHeld[Key] = false
	if (Input.LastPressed === Key) {
		Input.LastPressed = null
	}
	Input.OnInput("Release", Key, X, Y)
}

function KeyCodeToString(KeyCode) {
	// Alphanumeric?
	if ((KeyCode >= 48 && KeyCode <= 57) || (KeyCode >= 65 && KeyCode <= 90)) {
		return String.fromCharCode(KeyCode)
	}

	switch (KeyCode) {
		case 32: return "Spacebar"
		case 33: return "Page Up"
		case 34: return "Page Down"
		case 35: return "End"
		case 36: return "Home"
		case 37: return "Left"
		case 38: return "Up"
		case 39: return "Right"
		case 40: return "Down"
		case 45: return "Insert"
		case 46: return "Delete"
		case 189: return "Dash"
		case 190: return "Period"
	}

	return ""
}
