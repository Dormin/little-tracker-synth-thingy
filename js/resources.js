"use strict"

var Resources = {
	WaitTime: 0.1,
	OnLoaded: null,
	NumResources: 0,
	NumLoadedResources: 0,
	Images: []
}

function WaitForResources(OnLoaded) {
	Resources.OnLoaded = OnLoaded
	setTimeout(CheckResourcesLoaded, Resources.WaitTime * 1000)
}

function CheckResourcesLoaded() {
	if (Resources.NumLoadedResources === Resources.NumResources) {
		Resources.OnLoaded()
	} else {
		setTimeout(CheckResourcesLoaded, Resources.WaitTime * 1000)
	}
}

function LoadImage(Src) {
	var Id = Resources.Images.length
	Resources.NumResources++
	Resources.Images[Id] = new Image()
	Resources.Images[Id].onload = OnImageLoaded
	Resources.Images[Id].src = Src
	return Id
}

function OnImageLoaded() {
	Resources.NumLoadedResources++
}
