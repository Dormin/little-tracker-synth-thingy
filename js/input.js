"use strict"

var Input = {
	RepeatDelay: 0.5,
	RepeatStep: 0.05,
	IsHeldNext: {},
	IsHeld: {},
	WasPressed: {},
	WasReleased: {},
	IsRepeating: {},
	RepeatTime: {},
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
			var IsRepeating = false
			var RepeatTime = Input.RepeatTime[Key]

			if (IsHeld) {
				RepeatTime -= DeltaTime
				if (RepeatTime <= 0) {
					RepeatTime += Input.RepeatStep
					IsRepeating = true
				}
			} else {
				RepeatTime = Input.RepeatDelay
			}

			Input.IsHeld[Key] = IsHeldNext
			Input.WasPressed[Key] = WasPressed
			Input.WasReleased[Key] = WasReleased
			Input.IsRepeating[Key] = WasPressed || IsRepeating
			Input.RepeatTime[Key] = RepeatTime
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
	return Input.IsRepeating[Key]
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
