"use strict"

var Instruments = []

function InitInstruments() {
	var NumInstruments = 26 // A-Z
	for (var i = 0; i < NumInstruments; i++) {
		Instruments[i] = {
			Gain: 1,
			EgDecay: 0,
			VcoBalance: 0,
			Vco2Pitch: 0,
			VcoEgInt: 0,
			VcfCutoff: 1,
			VcfResonance: 0,
			VcfEgInt: 0
		}
	}
}
