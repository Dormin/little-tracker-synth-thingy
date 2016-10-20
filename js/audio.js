"use strict"

var AudioState = {}

function StartAudio(OnProcess) {
	var BufferSize = 2048
	var Context = new AudioContext()
	var ScriptNode = Context.createScriptProcessor(BufferSize, 2, 2)

	AudioState.OnProcess = OnProcess
	AudioState.Context = Context
	AudioState.ScriptNode = ScriptNode

	ScriptNode.onaudioprocess = AudioOnProcess
	ScriptNode.connect(Context.destination)
}

function AudioOnProcess(Event) {
	var OutputL = Event.outputBuffer.getChannelData(0)
	var OutputR = Event.outputBuffer.getChannelData(1)
	var NumSamples = OutputL.length
	var SampleRate = AudioState.Context.sampleRate
	AudioState.OnProcess(OutputL, OutputR, NumSamples, SampleRate)
}
