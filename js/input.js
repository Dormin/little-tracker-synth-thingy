"use strict"

var Input = {
	RepeatDelay: 0.5,
	RepeatStep: 0.05,
	MouseX: 0,
	MouseY: 0,
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

function KeyIsHeld(Key) {
	return Input.IsHeld[Key]
}

function StartInput(OnInput) {
	Input.OnInput = OnInput
	window.onkeydown = OnKeyDown
	window.onkeyup = OnKeyUp
	window.onmousedown = OnMouseDown
	window.onmouseup = OnMouseUp
	window.onmousemove = OnMouseMove
}

function OnKeyDown(Event) {
	var Key = KeyCodeToString(Event.keyCode)
	HandleKeyDown(Key)
}

function OnKeyUp(Event) {
	var Key = KeyCodeToString(Event.keyCode)
	HandleKeyUp(Key)
}

function OnMouseDown(Event) {
	UpdateMousePosition(Event)
	HandleKeyDown("Mouse")
}

function OnMouseUp(Event) {
	UpdateMousePosition(Event)
	HandleKeyUp("Mouse")
}

function OnMouseMove(Event) {
	UpdateMousePosition(Event)
	Input.OnInput("Move", "Mouse")
}

function UpdateMousePosition(Event) {
	Input.MouseX = Math.floor((Event.pageX - GetCanvasPositionX()) / Canvas.PixelWidth)
	Input.MouseY = Math.floor((Event.pageY - GetCanvasPositionY()) / Canvas.PixelHeight)
}

function HandleKeyDown(Key) {
	var Time = performance.now() / 1000
	
	if (!Input.IsHeld[Key]) {
		Input.IsHeld[Key] = true
		Input.LastPressed = Key
		Input.RepeatTime = Input.RepeatDelay
		Input.Time = Time
		Input.OnInput("Press", Key)
	} else if (Input.LastPressed === Key) {
		var DeltaTime = Time - Input.Time
		Input.Time = Time
		Input.RepeatTime -= DeltaTime
		if (Input.RepeatTime <= 0) {
			Input.RepeatTime += Input.RepeatStep
			Input.OnInput("Repeat", Key)
		}
	}
}

function HandleKeyUp(Key) {
	Input.IsHeld[Key] = false
	if (Input.LastPressed === Key) {
		Input.LastPressed = null
	}
	Input.OnInput("Release", Key)
}

function KeyCodeToString(KeyCode) {
	// Alphanumeric?
	if ((KeyCode >= 48 && KeyCode <= 57) || (KeyCode >= 65 && KeyCode <= 90)) {
		return String.fromCharCode(KeyCode)
	}

	switch (KeyCode) {
		case 16: return "Shift"
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
