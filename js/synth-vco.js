"use strict"

var SynthVco = {
	Note: [],
	TargetNote: [],
	PortaDuration: [],
	PortaTime: [],
	Vco2Pitch: [],
	EgInt: [],
	Output: [],
	Time: []
}

function InitSynthVco() {
	for (var Track = 0; Track < Constants.NumTracks; Track++) {
		SynthVco.Note[Track] = 0
		SynthVco.TargetNote[Track] = 0
		SynthVco.PortaDuration[Track] = 0
		SynthVco.PortaTime[Track] = 0
		SynthVco.Vco2Pitch[Track] = 0
		SynthVco.EgInt[Track] = 0
		SynthVco.Output[Track] = CreateBuffer(Audio.BufferSize),
		SynthVco.Time[Track] = 0
	}
}

function SynthVcoNoteOn(Track, Note, Retrigger) {
	SynthVco.TargetNote[Track] = Note
	SynthVco.PortaTime[Track] = 0
	if (Retrigger) {
		SynthVco.Note[Track] = Note
	}
}

function ProcessSynthVco(Track, NumSamples) {
	var SampleRate = Audio.SampleRate
	var Note = SynthVco.Note[Track]
	var TargetNote = SynthVco.TargetNote[Track]
	var PortaDuration = SynthVco.PortaDuration[Track]
	var PortaTime = SynthVco.PortaTime[Track]
	var Vco2Pitch = SynthVco.Vco2Pitch[Track]
	var EgInt = SynthVco.EgInt[Track]
	var Output = SynthVco.Output[Track]
	var Time = SynthVco.Time[Track]
	
	for (var i = 0; i < NumSamples; i++) {
		var DeltaNote = TargetNote - Note
		var DeltaPorta = PortaDuration - PortaTime
		var Freq = 440 * Math.pow(2, Note / 12)
		Output[i] = SawWave(Time)
		if (DeltaPorta > 0) {
			Note += DeltaNote / DeltaPorta / SampleRate
		} else {
			Note = TargetNote
		}
		PortaTime += 1 / SampleRate
		Time += Freq / SampleRate
	}

	SynthVco.Note[Track] = Note
	SynthVco.PortaTime[Track] = PortaTime
	SynthVco.Time[Track] = Time
}

function SineWave(Time) {
	return Math.sin(2 * Math.PI * Time)
}

function SawWave(Time) {
	return 1 - 2 * (Time % 1)
}
