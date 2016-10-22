"use strict"

var Audio = {
	BufferSize: 2048,
	SampleRate: 0,
	OnProcess: null,
	Context: null,
	ScriptNode: null
}

function StartAudio(OnProcess) {
	var Context = new AudioContext()
	var ScriptNode = Context.createScriptProcessor(Audio.BufferSize, 2, 2)

	Audio.SampleRate = Context.sampleRate
	Audio.OnProcess = OnProcess
	Audio.Context = Context
	Audio.ScriptNode = ScriptNode

	ScriptNode.onaudioprocess = OnAudioProcess
	ScriptNode.connect(Context.destination)
}

function OnAudioProcess(Event) {
	var OutputL = Event.outputBuffer.getChannelData(0)
	var OutputR = Event.outputBuffer.getChannelData(1)
	var NumSamples = OutputL.length
	Audio.OnProcess(OutputL, OutputR, NumSamples)
}
