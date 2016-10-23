"use strict"

var Input = {
	RepeatDelay: 0.5,
	RepeatStep: 0.05,
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
	for (var Key = 0; Key < 256; Key++) {
		Input.IsHeld[Key] = false
		Input.WasPressed[Key] = false
		Input.WasReleased[Key] = false
	}

	document.body.onkeydown = OnKeyDown
	document.body.onkeyup = OnKeyUp
}

function UpdateInput() {
	var Time = performance.now() / 1000
	var DeltaTime = Input.Time === null ? 0 : Time - Input.Time

	Input.Time = Time

	for (var Key in Input.IsHeldNext) {
		if (Input.IsHeldNext.hasOwnProperty(Key)) {
			var IsHeldNext = Input.IsHeldNext[Key]
			var IsHeld = Input.IsHeld[Key]
			var WasPressed = !IsHeld && IsHeldNext
			var WasReleased = IsHeld && !IsHeldNext

			if (WasPressed) {
				Input.LastPressed = Key
				Input.RepeatTime = Input.RepeatDelay
			} else if (WasReleased && Key === Input.LastPressed) {
				Input.LastPressed = null
			}

			Input.IsHeld[Key] = IsHeldNext
			Input.WasPressed[Key] = WasPressed
			Input.WasReleased[Key] = WasReleased
		}
	}

	if (Input.LastPressed !== null) {
		Input.LastIsRepeating = false
		Input.RepeatTime -= DeltaTime
		if (Input.RepeatTime <= 0) {
			Input.RepeatTime += Input.RepeatStep
			Input.LastIsRepeating = true
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

function KeyIsRepeating(Key) {
	return Key === Input.LastPressed && (Input.LastIsRepeating || Input.WasPressed[Key])
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

	switch (KeyCode) {
		case 37: return "Left"
		case 38: return "Up"
		case 39: return "Right"
		case 40: return "Down"
	}

	return ""
}
