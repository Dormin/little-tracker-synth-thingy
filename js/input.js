"use strict"

var Input = {
	IsHeld: [],
	WasPressed: [],
	WasReleased: []
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

function UpdateKeyState(Key, IsHeld) {
	Input.WasPressed[Key] = IsHeld && !Input.IsHeld[Key]
	Input.WasReleased[Key] = !IsHeld && Input.IsHeld[Key]
	Input.IsHeld[Key] = IsHeld
}
