"use strict"

var Instruments = []

function InitInstruments() {
	var NumInstruments = 26 // A-Z
	for (var i = 0; i < NumInstruments; i++) {
		Instruments[i] = {
			Volume: 1,
			Pan: 0,
			EgDecay: 0,
			VcoPortamento: 0,
			Vco2Pitch: 0,
			VcoEgInt: 0,
			VcfCutoff: 1,
			VcfResonance: 0,
			VcfEgInt: 0,
			DelayTime: 0,
			DelayInt: 0,
			DelaySync: true
		}
	}
}
