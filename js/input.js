"use strict"

var Input = {
	IsHeldNext: {},
	IsHeld: {},
	WasPressed: {},
	WasReleased: {}
}

function InitInput() {
	for (var Key = 0; Key < 256; Key++) {
		Input.IsHeld[Key] = false
		Input.WasPressed[Key] = false
		Input.WasReleased[Key] = false
	}

	document.body.onkeydown = OnKeyDown
	document.body.onkeyup = OnKeyUp
}

function UpdateInput() {
	for (var Key in Input.IsHeldNext) {
		if (Input.IsHeldNext.hasOwnProperty(Key)) {
			var IsHeldNext = Input.IsHeldNext[Key]
			var IsHeld = Input.IsHeld[Key]
			Input.IsHeld[Key] = IsHeldNext
			Input.WasPressed[Key] = !IsHeld && IsHeldNext
			Input.WasReleased[Key] = IsHeld && !IsHeldNext
		}
	}
}

function KeyIsHeld(Key) {
	return Input.IsHeld[Key]
}

function KeyWasPressed(Key) {
	return Input.WasPressed[Key]
}

function KeyWasReleased(Key) {
	return Input.WasReleased[Key]
}

function OnKeyDown(Event) {
	UpdateKeyState(Event.keyCode, true)
}

function OnKeyUp(Event) {
	UpdateKeyState(Event.keyCode, false)
}

function UpdateKeyState(KeyCode, IsHeld) {
	var Key = KeyCodeToString(KeyCode)
	Input.IsHeldNext[Key] = IsHeld
}

function KeyCodeToString(KeyCode) {
	// Alpha numeric?
	if ((KeyCode >= 48 && KeyCode <= 57) || (KeyCode >= 65 && KeyCode <= 90)) {
		return String.fromCharCode(KeyCode)
	}

	return ""
}
