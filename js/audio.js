"use strict"

var Audio = {}

function StartAudio(OnProcess) {
	var BufferSize = 2048
	var Context = new AudioContext()
	var ScriptNode = Context.createScriptProcessor(BufferSize, 2, 2)

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
	var SampleRate = Audio.Context.sampleRate
	Audio.OnProcess(OutputL, OutputR, NumSamples, SampleRate)
}
