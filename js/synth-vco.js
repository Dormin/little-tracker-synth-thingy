"use strict"

var SynthVco = {
	Note: [],
	TargetNote: [],
	PortaDuration: [],
	PortaTime: [],
	Vco2Detune: [],
	EgInt: [],
	Output: [],
	Vco1Time: [],
	Vco2Time: []
}

function InitSynthVco() {
	for (var Track = 0; Track < Constants.NumTracks; Track++) {
		SynthVco.Note[Track] = 0
		SynthVco.TargetNote[Track] = 0
		SynthVco.PortaDuration[Track] = 0
		SynthVco.PortaTime[Track] = 0
		SynthVco.Vco2Detune[Track] = 0
		SynthVco.EgInt[Track] = 0
		SynthVco.Output[Track] = CreateBuffer(Audio.BufferSize),
		SynthVco.Vco1Time[Track] = 0
		SynthVco.Vco2Time[Track] = 0
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
	var Vco2Detune = SynthVco.Vco2Detune[Track]
	var EgInt = SynthVco.EgInt[Track]
	var Output = SynthVco.Output[Track]
	var Vco1Time = SynthVco.Vco1Time[Track]
	var Vco2Time = SynthVco.Vco2Time[Track]
	var EgOutput = SynthEg.Output[Track]
	
	for (var i = 0; i < NumSamples; i++) {
		var DeltaNote = TargetNote - Note
		var DeltaPorta = PortaDuration - PortaTime
		var Vco1Note = Note + 48 * EgInt * EgOutput[i]
		var Vco2Note = Vco1Note + Vco2Detune
		var Vco1Freq = 440 * Math.pow(2, Vco1Note / 12)
		var Vco2Freq = 440 * Math.pow(2, Vco2Note / 12)

		Output[i] = (Wave(Vco1Time) + Wave(Vco2Time)) / 2
		if (DeltaPorta > 0) {
			Note += DeltaNote / DeltaPorta / SampleRate
		} else {
			Note = TargetNote
		}
		PortaTime += 1 / SampleRate
		Vco1Time = (Vco1Time + Vco1Freq / SampleRate) % 1
		Vco2Time = (Vco2Time + Vco2Freq / SampleRate) % 1
	}

	SynthVco.Note[Track] = Note
	SynthVco.PortaTime[Track] = PortaTime
	SynthVco.Vco1Time[Track] = Vco1Time
	SynthVco.Vco2Time[Track] = Vco2Time
}

function Wave(Time) {
	return SawWaveC(Time)
}

function SineWave(Time) {
	return Math.sin(2 * Math.PI * Time)
}

function SawWaveA(Time) {
	return 1 - 2 * (Time % 1)
}

function SawWaveB(Time) {
	return 2 * SineWave(0.25 * (Time % 1)) - 1
}

function SawWaveC(Time) {
	return -SineWave(Math.sqrt(1 - Math.pow(Time, 4)))
}
