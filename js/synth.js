"use strict"

var Synth = {
	Instrument: [],
}

function InitSynth() {
	InitSynthEg()
	InitSynthVco()
	InitSynthVcf()
	InitSynthAmp()
	InitSynthDelay()

	for (var Track = 0; Track < Constants.NumTracks; Track++) {
		Synth.Instrument[Track] = 0
	}
}

function SynthNoteOn(Track, Note, Retrigger) {
	Note -= 57
	SynthEgNoteOn(Track, Note, Retrigger)
	SynthVcoNoteOn(Track, Note, Retrigger)
	SynthAmpNoteOn(Track, Note, Retrigger)
}

function SynthNoteOff(Track) {
	SynthAmpNoteOff(Track)
}

function SynthNoteOffAll() {
	for (var Track = 0; Track < Constants.NumTracks; Track++) {
		SynthNoteOff(Track)
	}
}

function SetSynthInstrument(Track, Instrument) {
	Synth.Instrument[Track] = Instrument
}

function ProcessSynth(OutputL, OutputR, NumSamples, Offset) {
	var SampleRate = Audio.SampleRate
	var NumTracks = Constants.NumTracks

	for (var i = 0; i < NumSamples; i++) {
		OutputL[i + Offset] = 0
		OutputR[i + Offset] = 0
	}

	for (var Track = 0; Track < NumTracks; Track++) {
		var Instrument = Song.Instruments[Synth.Instrument[Track]]

		SynthEg.Duration[Track] = Instrument.EgDecay / 100
		ProcessSynthEg(Track, NumSamples)

		SynthVco.PortaDuration[Track] = Instrument.VcoPortamento / 100
		SynthVco.Vco2Detune[Track] = Instrument.Vco2Detune / 10
		SynthVco.EgInt[Track] = Instrument.VcoEgInt / 100
		ProcessSynthVco(Track, NumSamples)

		SynthVcf.Cutoff[Track] = Instrument.VcfCutoff / 100
		SynthVcf.Resonance[Track] = Instrument.VcfResonance / 100
		SynthVcf.EgInt[Track] = Instrument.VcfEgInt / 100
		ProcessSynthVcf(Track, NumSamples)

		SynthAmp.Volume[Track] = Instrument.Volume / 100
		ProcessSynthAmp(Track, NumSamples)

		SynthDelay.Intensity[Track] = Instrument.DelayInt / 100
		ProcessSynthDelay(Track, NumSamples)
	}

	for (var Track = 0; Track < NumTracks; Track++) {
		var Instrument = Song.Instruments[Synth.Instrument[Track]]
		var Input = SynthDelay.Output[Track]

		for (var i = 0; i < NumSamples; i++) {
			var Sample = Input[i] / NumTracks
			OutputL[i + Offset] += Sample
			OutputR[i + Offset] += Sample
		}
	}
}
