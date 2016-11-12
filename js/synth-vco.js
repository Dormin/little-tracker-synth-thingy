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
		SynthVco.Output[Track] = CreateBuffer(Audio.BufferSize)
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
	var EgOutput = SynthEg.Output[Track]
	var Note = SynthVco.Note[Track]
	var TargetNote = SynthVco.TargetNote[Track]
	var PortaDuration = SynthVco.PortaDuration[Track]
	var PortaTime = SynthVco.PortaTime[Track]
	var Vco2Detune = SynthVco.Vco2Detune[Track]
	var EgInt = SynthVco.EgInt[Track]
	var Output = SynthVco.Output[Track]
	var Vco1Time = SynthVco.Vco1Time[Track]
	var Vco2Time = SynthVco.Vco2Time[Track]
	
	for (var i = 0; i < NumSamples; i++) {
		var DeltaNote = TargetNote - Note
		var DeltaPorta = PortaDuration - PortaTime
		var Vco1Note = Note + 48 * EgInt * EgOutput[i]
		var Vco2Note = Vco1Note + Vco2Detune
		var Vco1Freq = 440 * Math.pow(2, Vco1Note / 12)
		var Vco2Freq = 440 * Math.pow(2, Vco2Note / 12)
		var Vco1Dt = Vco1Freq / SampleRate
		var Vco2Dt = Vco2Freq / SampleRate

		Output[i] = (Wave(Vco1Time, Vco1Dt) + Wave(Vco2Time, Vco2Dt)) / 2
		if (DeltaPorta > 0) {
			Note += DeltaNote / DeltaPorta / SampleRate
		} else {
			Note = TargetNote
		}
		PortaTime += 1 / SampleRate
		Vco1Time = (Vco1Time + Vco1Dt) % 1
		Vco2Time = (Vco2Time + Vco2Dt) % 1
	}

	SynthVco.Note[Track] = Note
	SynthVco.PortaTime[Track] = PortaTime
	SynthVco.Vco1Time[Track] = Vco1Time
	SynthVco.Vco2Time[Track] = Vco2Time
}

function Wave(X, Dx) {
	return SawWaveE(X, Dx)
}

function SineWave(X, Dx) {
	return Math.sin(2 * Math.PI * X)
}

function SawWaveA(X, Dx) {
	return 2 * (X % 1) - 1
}

function SawWaveB(X, Dx) {
	return 2 * SineWave(0.25 * (X % 1)) - 1
}

function SawWaveC(X, Dx) {
	return -SineWave(Math.sqrt(1 - Math.pow(X, 4)))
}

function SawWaveD(X, Dx) {
	return (SawWaveA(X) + SawWaveA(X + Dx / 2)) / 2
}

function SawWaveE(X, Dx) {
	var Dx2 = Math.max(0, X % 1 + Dx - 1)
	var Dx1 = Dx - Dx2
	var R = 0
	R += SawWaveA(X + Dx1 / 2) * Dx1
	R += SawWaveA(0 + Dx2 / 2) * Dx2
	return R / Dx
}
