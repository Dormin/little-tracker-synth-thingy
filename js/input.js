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
}

function OnKeyDown(Event) {
	var Key = KeyCodeToString(Event.keyCode)
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

function OnKeyUp(Event) {
	var Key = KeyCodeToString(Event.keyCode)

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
		case 32: return "Spacebar"
		case 37: return "Left"
		case 38: return "Up"
		case 39: return "Right"
		case 40: return "Down"
		case 189: return "Dash"
		case 190: return "Period"
	}

	return ""
}
